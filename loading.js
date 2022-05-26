(function(){

    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoad(event){
        console.log(event.target.result);
        var obj = JSON.parse(event.target.result);
        Plotly.newPlot(
            "mol-graph",
            {
                "data": [{ "y": [1, 2, 3] }],
                "layout": { "width": 600, "height": 400}
            }
        )
    }

    document.getElementById('file').addEventListener('change', onChange);

}());