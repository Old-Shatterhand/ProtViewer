const axis = {
	showbackground: false,
	zeroline: false,
	showgrid: false,
	showticklabels: false,
	showspikes: false,
	title: '',
};

const layout = {
	width: 1000,
	height: 1000,
	showlegend: false,
	scene: {
		xaxis: axis,
		yaxis: axis,
		zaxis: axis,
	},
	margin: {
		t: 100,
	},
	hovermode: 'closest',
	annotations: [],
};

var global_mol = null;

(function(){

    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoad(event){
        var bar = document.getElementById("bar");

        bar.style.width = 0 + "%";
        bar.innerHTML = 0 + "% - loading json";

        var mol = JSON.parse(event.target.result);

        visualize(mol);
    }

    document.getElementById('file').addEventListener('change', onChange);

}());

document.addEventListener("DOMContentLoaded", function () {
	Plotly.newPlot("mol-graph", [[], []], layout);

});

document.getElementById("example").addEventListener("click", loadExample);

document.getElementById("activity_check").addEventListener("change", changeVisualization);

document.getElementById("distance_check").addEventListener("change", changeVisualization);

function pearson(x, y) {
	var meanX = 0, meanY = 0;
	x.forEach(function (item, index, array) {
		meanX += x[index];
		meanY += y[index];
	});
	meanX /= x.length;
	meanY /= y.length;

	var cov = 0, varX = 0, varY = 0;
	x.forEach(function (item, index, array) {
		cov += (x[index] - meanX) * (y[index] - meanY);
		varX += Math.pow(x[index] - meanX, 2);
		varY += Math.pow(y[index] - meanY, 2);
	});
	return cov / (Math.sqrt(varX * varY));
}

function visualize(mol, acts = true, dists = true) {
	global_mol = mol;
	bar.style.width = 33 + "%";
	bar.innerHTML = 33 + "% - loading amino acids";

	var colors = [], x_pos = [], y_pos = [], z_pos = [], names = [], x_edge = [], y_edge = [], z_edge = [], x = [], y = [];
	var act_min = 0, act_max = 0, dist_min = 0, dist_max = 0;
	mol.nodes.forEach(function (item, index, array) {
		item.activity = parseFloat(item.activity);
		item.distance = parseFloat(item.distance);
		act_min = Math.min(item.activity, act_min);
		act_max = Math.max(item.activity, act_max);
		dist_min = Math.min(item.distance, dist_min);
		dist_max = Math.max(item.distance, dist_max);
	});
	var act_diff = act_max - act_min, dist_diff = dist_max - dist_min;
	mol.nodes.forEach(function (item, index, array) {
		const act_val = acts ? (item.activity - act_min) / act_diff : 0;
		const dist_val = dists ? (item.distance - act_min) / dist_diff : 0;
		x.push(act_val);
		y.push(dist_val);
		colors.push("rgb(" + 255 * act_val + "," + 255 * dist_val + ",0)");
		x_pos.push(item.x);
		y_pos.push(item.y);
		z_pos.push(item.z);
		names.push(
			"Name: " + item.name +  // .slice(-3) +
			(acts ? "<br>Act: " + act_val.toFixed(3) : "") +
			(dists ? "<br>Dist: " + dist_val.toFixed(3) : "")
		);
	});
	document.getElementById("correlation").innerHTML = "The Pearson correlation coefficient is: " + Math.round(pearson(x, y) * 100) / 100.0;

	bar.style.width = 67 + "%";
	bar.innerHTML = 67 + "% - loading bonds";

	mol.edges.start.forEach(function (item, index, array) {
		if (mol.edges.start[index] < mol.edges.end[index]) {
			x_edge.push(mol.nodes[mol.edges.start[index]].x);
			x_edge.push(mol.nodes[mol.edges.end[index]].x);
			y_edge.push(mol.nodes[mol.edges.start[index]].y);
			y_edge.push(mol.nodes[mol.edges.end[index]].y);
			z_edge.push(mol.nodes[mol.edges.start[index]].z);
			z_edge.push(mol.nodes[mol.edges.end[index]].z);
		}
	});

	var acids = {
		x: x_pos,
		y: y_pos,
		z: z_pos,
		mode: 'markers',
		marker: {
			color: colors,
			size: 20,
			symbol: 'circle',
		},
		type: 'scatter3d',
		text: names,
		hoverinfo: 'text',
	};

	var edges = {
		x: x_edge,
		y: y_edge,
		z: z_edge,
		mode: 'lines',
		line: {
			color: 'rgb(0,0,0)',
			width: 5,
		},
		hoverinfo: 'none',
		type: 'scatter3d',
	};

	Plotly.newPlot("mol-graph", [edges, acids], layout);

	bar.innerHTML = 100 + "% - finished";
	bar.style.width = 100 + "%";
}

function loadExample() {
	var mol = JSON.parse('{' +
		'"nodes": [' +
		'{"name": "0_THR", "x": 4.261000156402588, "y": -12.79699993133545, "z": 17.017000198364258, "activity": 0, "distance": 46}, ' +
		'{"name": "1_THR", "x": 5.7729997634887695, "y": -11.152999877929688, "z": 13.920999526977539, "activity": 1, "distance": 45}, ' +
		'{"name": "2_CYS", "x": 9.46500015258789, "y": -10.668000221252441, "z": 13.67199993133545, "activity": 2, "distance": 44}, ' +
		'{"name": "3_CYS", "x": 11.204000473022461, "y": -8.9350004196167, "z": 10.767000198364258, "activity": 3, "distance": 43}, ' +
		'{"name": "4_PRO", "x": 14.831000328063965, "y": -9.074999809265137, "z": 9.616999626159668, "activity": 4, "distance": 42}, ' +
		'{"name": "5_SER", "x": 15.121999740600586, "y": -5.3480000495910645, "z": 8.864999771118164, "activity": 5, "distance": 41}, ' +
		'{"name": "6_ILE", "x": 13.168999671936035, "y": -2.2260000705718994, "z": 9.217000007629395, "activity": 6, "distance": 40}, ' +
		'{"name": "7_VAL", "x": 12.112000465393066, "y": -2.055999994277954, "z": 5.551000118255615, "activity": 7, "distance": 39}, ' +
		'{"name": "8_ALA", "x": 10.92300033569336, "y": -5.730000019073486, "z": 5.714000225067139, "activity": 8, "distance": 38}, ' +
		'{"name": "9_ARG", "x": 8.652999877929688, "y": -4.581999778747559, "z": 8.562000274658203, "activity": 9, "distance": 37}, ' +
		'{"name": "10_SER", "x": 7.427000045776367, "y": -1.5670000314712524, "z": 6.5960001945495605, "activity": 10, "distance": 36}, ' +
		'{"name": "11_ASN", "x": 6.704999923706055, "y": -3.9619998931884766, "z": 3.6679999828338623, "activity": 11, "distance": 35}, ' +
		'{"name": "12_PHE", "x": 4.9120001792907715, "y": -6.410999774932861, "z": 5.881999969482422, "activity": 12, "distance": 34}, ' +
		'{"name": "13_ASN", "x": 2.680000066757202, "y": -3.621999979019165, "z": 7.318999767303467, "activity": 13, "distance": 33}, ' +
		'{"name": "14_VAL", "x": 1.6610000133514404, "y": -2.5339999198913574, "z": 3.796999931335449, "activity": 14, "distance": 32}, ' +
		'{"name": "15_CYS", "x": 1.0470000505447388, "y": -6.177000045776367, "z": 2.8340001106262207, "activity": 15, "distance": 31}, ' +
		'{"name": "16_ARG", "x": -1.2949999570846558, "y": -6.48199987411499, "z": 5.820000171661377, "activity": 16, "distance": 30}, ' +
		'{"name": "17_LEU", "x": -3.4200000762939453, "y": -3.431999921798706, "z": 4.909999847412109, "activity": 17, "distance": 29}, ' +
		'{"name": "18_PRO", "x": -5.876999855041504, "y": -5.234000205993652, "z": 2.630000114440918, "activity": 18, "distance": 28}, ' +
		'{"name": "19_GLY", "x": -6.01800012588501, "y": -8.166999816894531, "z": 5.169000148773193, "activity": 19, "distance": 27}, ' +
		'{"name": "20_THR", "x": -3.496999979019165, "y": -10.57800006866455, "z": 3.634000062942505, "activity": 20, "distance": 26}, ' +
		'{"name": "21_SER", "x": -2.5869998931884766, "y": -13.33899974822998, "z": 6.107999801635742, "activity": 21, "distance": 25}, ' +
		'{"name": "22_GLU", "x": 0.4390000104904175, "y": -13.003999710083008, "z": 8.079999923706055, "activity": 22, "distance": 24}, ' +
		'{"name": "23_ALA", "x": 1.9140000343322754, "y": -16.19099998474121, "z": 6.613999843597412, "activity": 23, "distance": 23}, ' +
		'{"name": "24_ILE", "x": 1.7869999408721924, "y": -14.91100025177002, "z": 3.0439999103546143, "activity": 24, "distance": 22}, ' +
		'{"name": "25_CYS", "x": 3.111999988555908, "y": -11.460000038146973, "z": 4.14300012588501, "activity": 25, "distance": 21}, ' +
		'{"name": "26_ALA", "x": 5.954999923706055, "y": -13.352999687194824, "z": 5.880000114440918, "activity": 26, "distance": 20}, ' +
		'{"name": "27_THR", "x": 7.105000019073486, "y": -15.20199966430664, "z": 2.7639999389648438, "activity": 27, "distance": 19}, ' +
		'{"name": "28_TYR", "x": 6.603000164031982, "y": -11.998000144958496, "z": 0.7770000100135803, "activity": 28, "distance": 18}, ' +
		'{"name": "29_THR", "x": 8.859000205993652, "y": -9.890000343322754, "z": 2.9839999675750732, "activity": 29, "distance": 17}, ' +
		'{"name": "30_GLY", "x": 11.223999977111816, "y": -12.20199966430664, "z": 4.811999797821045, "activity": 30, "distance": 16}, ' +
		'{"name": "31_CYS", "x": 9.48900032043457, "y": -11.597999572753906, "z": 8.126999855041504, "activity": 31, "distance": 15}, ' +
		'{"name": "32_ILE", "x": 8.565999984741211, "y": -14.633999824523926, "z": 10.237000465393066, "activity": 32, "distance": 14}, ' +
		'{"name": "33_ILE", "x": 5.901000022888184, "y": -15.927000045776367, "z": 12.545999526977539, "activity": 33, "distance": 13}, ' +
		'{"name": "34_ILE", "x": 6.71999979019165, "y": -17.367000579833984, "z": 15.871000289916992, "activity": 34, "distance": 12}, ' +
		'{"name": "35_PRO", "x": 4.488999843597412, "y": -18.82200050354004, "z": 18.59000015258789, "activity": 35, "distance": 11}, ' +
		'{"name": "36_GLY", "x": 6.0980000495910645, "y": -16.885000228881836, "z": 21.437000274658203, "activity": 36, "distance": 10}, ' +
		'{"name": "37_ALA", "x": 6.36899995803833, "y": -13.159000396728516, "z": 22.065000534057617, "activity": 37, "distance": 9}, ' +
		'{"name": "38_THR", "x": 10.154999732971191, "y": -12.609999656677246, "z": 21.92300033569336, "activity": 38, "distance": 8}, ' +
		'{"name": "39_CYS", "x": 11.947999954223633, "y": -12.142999649047852, "z": 18.542999267578125, "activity": 39, "distance": 7}, ' +
		'{"name": "40_PRO", "x": 15.63700008392334, "y": -13.145999908447266, "z": 18.091999053955078, "activity": 40, "distance": 6}, ' +
		'{"name": "41_GLY", "x": 18.492000579833984, "y": -10.770999908447266, "z": 17.36400032043457, "activity": 41, "distance": 5}, ' +
		'{"name": "42_ASP", "x": 18.466999053955078, "y": -11.727999687194824, "z": 13.819999694824219, "activity": 42, "distance": 4}, ' +
		'{"name": "43_TYR", "x": 14.795999526977539, "y": -10.72599983215332, "z": 13.383000373840332, "activity": 43, "distance": 3}, ' +
		'{"name": "44_ALA", "x": 15.022000312805176, "y": -7.650000095367432, "z": 15.54699993133545, "activity": 44, "distance": 2}, ' +
		'{"name": "45_ASN", "x": 12.645000457763672, "y": -5.3470001220703125, "z": 13.626999855041504, "activity": 45, "distance": 1}' +
		'], "edges": {"start": [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40, 41, 41, 42, 42, 43, 43, 44, 44, 45], "end": [1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17, 19, 18, 20, 19, 21, 20, 22, 21, 23, 22, 24, 23, 25, 24, 26, 25, 27, 26, 28, 27, 29, 28, 30, 29, 31, 30, 32, 31, 33, 32, 34, 33, 35, 34, 36, 35, 37, 36, 38, 37, 39, 38, 40, 39, 41, 40, 42, 41, 43, 42, 44, 43, 45, 44]}}');
	visualize(mol);
}

function changeVisualization(){
	visualize(global_mol, document.getElementById("activity_check").checked, document.getElementById("distance_check").checked);
}


