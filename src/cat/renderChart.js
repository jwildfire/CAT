import { createChartExport } from './export/createChartExport';
import { showEnv } from './env/showEnv';

export function renderChart(cat) {
    var rendererObj = cat.controls.rendererSelect.selectAll('option:checked').data()[0];
    cat.settings.sync(cat);
    //render the new chart with the current settings
    var dataFile = cat.controls.dataFileSelect.node().value;
    cat.current.data = dataFile;
    var dataObject = cat.config.dataFiles.find(f => f.label == dataFile);
    var version = cat.controls.versionSelect.node().value;
    cat.current.main = cat.controls.mainFunction.node().value;
    cat.current.sub = cat.controls.subFunction.node().value.split('.');

    function render(error, data) {
        let myChart;
        if (error) {
            cat.status.loadStatus(cat.statusDiv, false, dataFilePath);
        } else {
            cat.status.loadStatus(cat.statusDiv, true, dataFilePath);
            if (cat.current.sub.join('') !== '') {
                myChart = window[cat.current.main];
                cat.current.sub.forEach(subsub => {
                    myChart = myChart[subsub];
                });
                myChart = myChart('.cat-chart', cat.current.config);
                cat.status.chartCreateStatus(cat.statusDiv, cat.current.main, cat.current.sub[0]);
            } else {
                myChart = window[cat.current.main]('.cat-chart .chart', cat.current.config);
                cat.status.chartCreateStatus(cat.statusDiv, cat.current.main);
            }

            cat.current.htmlExport = createChartExport(cat); // save the source code before init

            try {
                myChart.init(data);
            } catch (err) {
                cat.status.chartInitStatus.call(cat, cat.statusDiv, false, err);
            } finally {
                cat.status.chartInitStatus.call(
                    cat,
                    cat.statusDiv,
                    true,
                    null,
                    cat.current.htmlExport
                );

                // save to server button
                if (cat.config.useServer) {
                    cat.status.saveToServer(cat);
                }
                showEnv.call(cat);

                //don't print any new statuses until a new chart is rendered
                cat.printStatus = false;
            }
        }
    }

    if (dataObject.user_loaded) {
        dataObject.json = d3.csv.parse(dataObject.csv_raw);
        render(false, dataObject.json);
    } else {
        var dataFilePath = dataObject.path + dataFile;
        d3.csv(dataFilePath, function(error, data) {
            render(error, data);
        });
    }
}
