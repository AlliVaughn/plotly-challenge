
async function buildMetadata(sample) {

   // Use `d3.json` to fetch the metadata for a sample
   const url = "/metadata/" + sample;
   let data = await d3.json(url);
 
   // Use d3 to select the panel with id of `#sample-metadata`
   let panel = d3.select('#sample-metadata');
 
   // clear metadata
   panel.html("");
 
   //  add each key-value pair to the panel
   let pairs = Object.entries(data);
   //loop over and append each as a paragraph of text 
    pairs.forEach(pair => panel.append("p").text( pair[0] + ": " + pair[1])); 
   
}

async function buildCharts(sample) {
  // Use `d3.json` to fetch the sample data for the plots
  const url = "/samples/" + sample;
  let data = await d3.json(url);
  
  //grab that value WFREQ value from the panel for the gauge (yes, it works as a numerical value for these purposes)
  freq = d3.select("#sample-metadata > p:nth-child(6)").text().slice(7,8);

//build the TOP TEN  pie chart, though I grabbed all in this case and sliced below because we may want to add top X functionality later to slice a bigger pie. 
  
  let sample_values = data.sample_values;
  let otu_ids = data.otu_ids;
  let otu_labels = data.otu_labels;
  
 //COLORS
  let ultimateColors = [
    ['#040b10', '#091520', '#0d2030', '#122a40', '#1663550', '#1b3f5f', '#1f4a6f', '#24557f', '#285f8f', '#2d6a9f']
  ];
  
  let pie_data = {
    values: sample_values.slice(0,10),
    labels: otu_ids.slice(0,10),
    type: 'pie',
    marker: {
      // FANCY COLORS 
      colors: ultimateColors[0], 
      labels: otu_ids, 
    },
    hovertext: otu_labels.slice(0,10)
  }

  let pie_layout = {
    title: "Top 10 OTU ID Counts",
    //CUSTOM FONT
    font: { size: 18, color: "#040b10" ,family:"Arial"} 
     
  }

  Plotly.newPlot("pie", [pie_data], pie_layout);

  // BONUS GUAGE
  var guage_data = [
    
    {
      type: "indicator",
      mode: "gauge+number",
      // value from panel
      value: freq,
      //CUSTOM FONT
      title: { text: "Belly Button Washing Frequency  <br>  Scrubs per Week <br> <br>", font: { size: 24, color: "#040b10" ,family:"Arial"} }, 
      gauge: {
        axis: { range: [null, 10], tickwidth: 1, tickcolor: "rgb(13, 32, 48)" },
        bar: { color: "black" },
        bgcolor: "white",
        borderwidth: 1,
        bordercolor: "gray",
        steps: [
          { range: [0, 2], color: "rgb(31, 119, 180)"},
          { range: [2, 4], color: "#cfe2f2"},
          { range: [4, 6], color: "rgb(31, 119, 180)"},
          { range: [6, 8], color: "#cfe2f2"},
          { range: [8, 10], color: "rgb(31, 119, 180)"},


        ],
      }
    }
  ];
  
  var guage_layout = {
    width: 500,
    height: 400,
    // Here JIC 
    margin: { t: 50, r: 25, l: 25, b: 25 },
    //Background transparent
    paper_bgcolor: 'rgba(0,0,0,0)', 
  };
  
  Plotly.newPlot("gauge", guage_data, guage_layout);


// Build a Bubble Chart using the sample data
  let bubble_data = {
    type:"scatter",
    x: otu_ids,
    y: sample_values,
    mode: 'markers',
    
    marker: {
              color: otu_ids,
              size: sample_values, 
              // colorscale: "YIGnBu"
              colorscale: "Greys"
            },
    hovertext: otu_labels
  }

  let bubble_layout = {
    title: {text: "OTU IDs in Sample", font: { size: 24, color: "#040b10" ,family:"Arial"} },  
    xaxis: {
      title: {
        text: 'OTU ID', font: { size: 18, color: "#040b10" ,family:"Arial"}
        
      }
    },
    yaxis: {
      title: {
        text:'SAMPLE VALUE', font: { size: 18, color: "#040b10" ,family:"Arial"} 
      }  
    }
  };

Plotly.newPlot("bubble", [bubble_data], bubble_layout);
    
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
