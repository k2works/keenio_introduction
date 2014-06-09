// create an event as a JS object
var purchase = {
    category: "magical animals",
    animal_type: "pegasus",
    username: "perseus",
    payment_type: "head of medusa",
    price: 4.50
};
// add it to the "purchases" collection
Keen.addEvent("purchases", purchase);

Keen.onChartsReady(function() {
    var metric = new Keen.Metric("purchases", {
        analysisType: "sum",
        targetProperty: "price",
        timeframe: "this_7_days"
    });

    //Get the result of the query and alert it.
    metric.getResponse(function(response){
        alert(response.result);
    });

    metric.draw(document.getElementById("myTotalRevenueDiv"), {
        label: "Total Revenue for Last 7 Days",
        prefix: "¥"
    });
});

Keen.onChartsReady(function() {
    var series = new Keen.Series("purchases", {
        analysisType: "count",
        timeframe: "this_7_days",
        interval: "daily"
    });

    series.draw(document.getElementById("myTotalRevenueLineDiv"), {
        label: "Purchases per day for Last 7 Days"
    });
});
