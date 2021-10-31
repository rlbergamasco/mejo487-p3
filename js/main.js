var mapData = {};
var slider = document.getElementById("myRange");
var year = slider.value;
var yearContainer = document.getElementById("current-year");
var map;
var data;
var isPerCapita = false;
var isPlaying = false;

yearContainer.innerHTML = year;

$(document).ready(function () {
    console.log("ready");
    console.log("loading");
    loadData();
});

function loadData() {
    $.getJSON("data/energy.json", function (jsonData) {
        data = jsonData;
        createMapData();
        buildMap();
        parseData(data);
    });
}

function parseData(data) {
    console.log(data);
    const htmlHeader = `<thead><tr>
                        <th>Year</th>
                        <th>Country</th>
                        <th>Population</th>
                        <th>Primary Energy Consumption (TWh)</th>
                        <th>Consumption per Capita (MWh)</th>
                        </tr></thead>`;
    let htmlBody = `<tbody>`
    $.each(data, function (i) {
        $.each(data[i].years, function (j) {
            let current = data[i].years[j];
            htmlBody += `<tr>`;
            htmlBody += `<td>${current[0]}</td>`;
            htmlBody += `<td>${data[i].country}</td>`;
            htmlBody += `<td>${current[1]}</td>`;
            htmlBody += `<td>${current[2]}</td>`;
            let percapita = current[2] / current[1] * 1000000;
            percapita = percapita.toFixed(3)
            htmlBody += `<td>${percapita}</td>`;
            htmlBody += `</tr>`;
        });
    });
    console.log(mapData)
    htmlBody += `</tbody>`;
    $('#my-table').append(htmlHeader);
    $('#my-table').append(htmlBody);
    buildTable();
}

function buildTable() {
    $('#my-table').DataTable();
    console.log("done");
}

function createMapData() {
    if (isPerCapita) {
        $.each(data, function (i) {
            if (data[i].years[year] != undefined) {
                let tempCapita = data[i].years[year][2] / data[i].years[year][1] * 1000000;
                tempCapita = tempCapita.toFixed(3);
                let key = "Unknown";
                if (tempCapita < 40) {
                    key = "0-39";
                } else if (tempCapita < 60) {
                    key = "40-59";
                } else if (tempCapita < 80) {
                    key = "60-79";
                } else if (tempCapita < 100) {
                    key = "80-99";
                } else if (tempCapita < 120) {
                    key = "100-119";
                } else {
                    key = "120+";
                }
                mapData[data[i].iso] = {
                    fillKey: key,
                    count: tempCapita
                };
            }
        });
    } else {
        $.each(data, function (i) {
            if (data[i].years[year] != undefined) {
                let total = data[i].years[year][2];
                let key = "Unknown";
                if (total < 400) {
                    key = "0-499";
                } else if (total < 800) {
                    key = "500-999";
                } else if (total < 1200) {
                    key = "1000-1499";
                } else if (total < 1600) {
                    key = "1500-1999";
                } else if (total < 20000) {
                    key = "2000-19,999";
                } else {
                    key = "20,000+";
                }
                mapData[data[i].iso] = {
                    fillKey: key,
                    count: total
                };
            }
        });
    }

}

function buildMap() {
    map = new Datamap({
        element: document.getElementById('map'),
        projection: 'mercator',
        responsive: true,
        fills: isPerCapita ? {
            Unknown: '#d6d6d6',
            "0-39": '#bfdcf1',
            "40-59": '#95CFF9',
            "60-79": '#5fb9fa',
            "80-99": '#4da4e1',
            "100-119": '#3C8FC9',
            "120+": '#2b6690',
            defaultFill: '#d6d6d6'
        } : {
            Unknown: '#d6d6d6',
            "0-499": '#bfdcf1',
            "500-999": '#95CFF9',
            "1000-1499": '#5fb9fa',
            "1500-1999": '#4da4e1',
            "2000-19,999": '#3C8FC9',
            "20,000+": '#2b6690',
            defaultFill: '#d6d6d6'
        },
        data: mapData,
        geographyConfig: {
            popupTemplate: function (geo, data) {
                return ['<div class="hoverinfo">',
                    geo.properties.name + ": <strong>",
                    + data.count,
                    '</strong></div>'].join('');
            },
            highlightFillColor: '#0a4066',
            highlightBorderColor: '#ffffff',
        }
    });
    map.legend();
}

window.addEventListener("resize", function () {
    map.resize();
});

function updateMap() {
    createMapData();
    map.updateChoropleth(mapData);
    yearContainer.innerHTML = year;
}

slider.oninput = function () {
    year = this.value;
    updateMap();
}

$("#restart").click(function () {
    year = 1965;
    updateMap();
    slider.value = year;
});

$("#back").click(function () {
    if (year > 1965) { year--; }
    updateMap();
    slider.value = year;
});

$("#next").click(function () {
    if (year < 2016) { year++; }
    updateMap();
    slider.value = year;
});

$("#play").click(function () {
    isPlaying = true;
    $("#play-pause").removeClass('play');
    $("#play-pause").addClass('pause');
    go();
});

$("#pause").click(function () {
    $("#play-pause").removeClass('pause');
    $("#play-pause").addClass('play');
    isPlaying = false;
});

function wait() {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, 200);
    })
}

async function go() {
    while (year < 2016 && isPlaying) {
        year++;
        slider.value = year;
        updateMap();
        await wait();
    }
}

$("#total").click(function () {
    $("#total").addClass('active');
    $("#percapita").removeClass('active');
    isPerCapita = false;
    updateMap();
    $("svg.datamap").remove();
    buildMap();
});

$("#percapita").click(function () {
    $("#percapita").addClass('active');
    $("#total").removeClass('active');
    isPerCapita = true;
    updateMap();
    $("svg.datamap").remove();
    buildMap();
});

// function convertJsonData(data) {
//     let newData = [];
//     $.each(data, function (i) {
//         let current = newData.find(element => element.iso === data[i].iso);
//         if (current === undefined) {
//             newData.push({
//                 "iso": data[i].iso,
//                 "country": data[i].country,
//                 "years": {}
//             })
//         }
//         current = newData.find(element => element.iso === data[i].iso);
//         current.years[data[i].year] = [data[i].year, data[i].population, data[i].consumption];
//     });
//     console.log(newData);
// }