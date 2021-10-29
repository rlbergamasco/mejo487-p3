let year = 2016;

$(document).ready(function () {
    console.log("ready");
    console.log("loading")
    loadData();
});

function loadData() {
    $.getJSON("data/energy-data.json", function (data) {
        parseData(data);
    });
}

function parseData(data) {
    // filtered = data.filter(item => item.year === year);
    const htmlHeader = `<thead><tr>
                        <th>Year</th>
                        <th>Country</th>
                        <th>Population</th>
                        <th>Primary Energy Consumption (TWh)</th>
                        <th>Consumption per Capita (MWh)</th>
                        </tr></thead>`;
    let htmlBody = `<tbody>`;

    $.each(data, function (index) {
        htmlBody += `<tr>`;
        htmlBody += `<td>${data[index].year}</td>`;
        htmlBody += `<td>${data[index].country}</td>`;
        htmlBody += `<td>${data[index].population}</td>`;
        htmlBody += `<td>${data[index].consumption}</td>`;
        let percapita = data[index].consumption / data[index].population * 1000000;
        percapita = percapita.toFixed(3)
        percapita = data[index].consumption === "" ? "" : percapita
        htmlBody += `<td>${percapita}</td>`;
        htmlBody += `</tr>`;
    });
    htmlBody += `</tbody>`;


    $('#my-table').append(htmlHeader);
    $('#my-table').append(htmlBody);
    buildTable();
}

function buildTable() {
    $('#my-table').DataTable();
    console.log("done")
}