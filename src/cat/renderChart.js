import { exportChart } from "./export/exportChart";

export function renderChart(cat) {
  var rendererObj = cat.controls.rendererSelect
    .selectAll("option:checked")
    .data()[0];
  cat.settings.sync(cat);
  //render the new chart with the current settings
  var dataFile = cat.controls.dataFileSelect.node().value;
  var dataFilePath = cat.config.dataURL + dataFile;
  var version = cat.controls.versionSelect.node().value;
  cat.current.main = cat.controls.mainFunction.node().value;
  cat.current.sub = cat.controls.subFunction.node().value;

  d3.csv(dataFilePath, function(error, data) {
    if (error) {
      cat.statusDiv
        .html(
          "Failed to load data from <i>" +
            dataFilePath +
            "</i>. Aborting chart renderering. "
        )
        .classed("error", true);
    } else {
      cat.statusDiv
        .append("div")
        .html(
          "Loaded data from <i>" +
            dataFilePath +
            "</i>. Initializing the chart ...  "
        );

      if (cat.current.sub) {
        var myChart = window[cat.current.main][cat.current.sub](
          ".cat-chart",
          cat.current.config
        );
        cat.statusDiv
          .append("div")
          .html(
            "Rendered the chart by calling <i>" +
              cat.current.main +
              "." +
              cat.current.sub +
              "()</i> with the following settings:<br><small><i>" +
              JSON.stringify(cat.current.config) +
              "</small></i><br>Initializing the chart with the loaded data next ..."
          )
          .classed("info", true);
      } else {
        var myChart = window[cat.current.main](
          ".cat-chart .chart",
          cat.current.config
        );

        cat.statusDiv
          .append("div")
          .html(
            "Creating the chart by calling <i>" +
              cat.current.main +
              "()</i> with the following settings:<br><small><i>" +
              JSON.stringify(cat.current.config) +
              "</small></i><br> Initializing the chart with the loaded data next ..."
          )
          .classed("info", true);
      }

      cat.current.htmlExport = exportChart(cat); // save the source code before init

      try {
        myChart.init(data);
      } catch (err) {
        cat.statusDiv
          .append("div")
          .html(
            "There might've been some problems initializing the chart. Errors include:<br><small><i>" +
              err +
              "</i></small>"
          )
          .classed("error", true);
      } finally {
        cat.statusDiv.selectAll("div:not(.error)").classed("hidden", true);
        cat.statusDiv
          .append("div")
          .attr("class", "summary")
          .html(
            "All Done. Your <i>" +
              cat.current.name +
              "</i> should be below. <span class='details'>Show full log</span>"
          )
          .classed("info", true);

        if (cat.config.useServer) {
          var saveSpan = cat.statusDiv.select("div.summary").append("span");

          var saveButton = saveSpan
            .append("span")
            .text("Save a copy?")
            .style("cursor", "pointer")
            .style("text-decoration", "underline")
            .on("click", function() {
              d3.select(this.remove());
              var chartObj = { chart: btoa(cat.current.htmlExport) };
              $.post("./export/", chartObj, function(data) {
                saveSpan.html(
                  "Chart saved as <a href='" +
                    data.url +
                    "'>" +
                    data.url +
                    "</a>"
                );
              }).fail(function() {
                saveSpan
                  .text("Sorry. Couldn't save the chart.")
                  .style("text", "red");
                console.warn("Error :( Something went wrong saving the chart.");
              });
            });
        }

        cat.statusDiv
          .select("span.details")
          .style("cursor", "pointer")
          .style("text-decoration", "underline")
          .style("float", "right")
          .on("click", function() {
            d3.select(this).remove();
            cat.statusDiv.selectAll("div").classed("hidden", false);
          });

        cat.statusDiv
          .append("div")
          .classed("hidden", true)
          .classed("info", true)
          .html(
            "&#9432; Just because there are no errors doesn't mean there can't be problems. If things look strange, it might be a problem with the settings/data combo or with the renderer itself."
          );

        cat.statusDiv
          .append("div")
          .classed("hidden", true)
          .classed("export", true)
          .classed("minimized", true)
          .html("Click to see chart's full source code");

        cat.statusDiv.select("div.export.minimized").on("click", function() {
          d3.select(this).classed("minimized", false);
          d3.select(this).html("<strong>Source code for chart:</strong>");
          d3
            .select(this)
            .append("code")
            .html(
              cat.current.htmlExport
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br/>")
                .replace(/ /g, "&nbsp;")
            );
        });

        cat.printStatus = false;
      }
    }
  });
}
