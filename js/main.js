var year = 2002;
var mapData = {};
var testing = {};

$(document).ready(function () {
    console.log("ready");
    console.log("loading")
    loadData();
});

function loadData() {
    $.getJSON("data/energy.json", function (data) {
        parseData(data);
    });
}

function parseData(data) {
    console.log(data);
    // let newData = [];
    // $.each(data, function (i) {
    //     let current = newData.find(element => element.iso === data[i].iso);
    //     if (current === undefined) {
    //         newData.push({
    //             "iso": data[i].iso,
    //             "country": data[i].country,
    //             "years": {}
    //         })
    //     }
    //     current = newData.find(element => element.iso === data[i].iso);
    //     current.years[data[i].year] = [data[i].year, data[i].population, data[i].consumption];
    // });
    // console.log(newData);

    const htmlHeader = `<thead><tr>
                        <th>Year</th>
                        <th>Country</th>
                        <th>Population</th>
                        <th>Primary Energy Consumption (TWh)</th>
                        <th>Consumption per Capita (MWh)</th>
                        </tr></thead>`;
    let htmlBody = `<tbody>`
    $.each(data, function (i) {
        if (data[i].years[year] != undefined) {
            let tempCapita = data[i].years[year][2] / data[i].years[year][1] * 1000000;
            tempCapita = tempCapita.toFixed(3)
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
            testing["USA"] = {
                fillKey: "0-59",
                count: 12
            };
        }

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
    buildMap();
}

function buildTable() {
    $('#my-table').DataTable();
    console.log(testing)
    console.log("done")
}

function buildMap() {
    var map = new Datamap({
        element: document.getElementById('map'),
        responsive: true,
        fills: {
            Unknown: '#d6d6d6',
            "0-39": '#bfdcf1',
            "40-59": '#95CFF9',
            "60-79": '#5fb9fa',
            "80-99": '#4da4e1',
            "100-119": '#3C8FC9',
            "120+": '#2b6690',
            defaultFill: '#d6d6d6'
        },
        // data: testing,
        data: mapData,
        geographyConfig: {
            popupTemplate: function (geo, data) {
                return ['<div class="hoverinfo">',
                    geo.properties.name + ": <strong>",
                    + data.count,
                    '</strong></div>'].join('');
            }
        }
    });

    map.legend();
}


window.addEventListener("resize", function () {
    map.resize();
});