export function initFileLoad() {
    const cat = this;

    this.controls.dataFileLoad
        .on('change', function() {
            if (this.value.slice(-4).toLowerCase() == '.csv') {
                loadStatus.text(this.files[0].name + ' ready to load').style('color', 'green');
                cat.controls.dataFileLoadButton.attr('disabled', null);
            } else {
                loadStatus.text(this.files[0].name + ' is not a csv').style('color', 'red');
                cat.controls.dataFileLoadButton.attr('disabled', true);
            }
        });

    this.controls.dataFileLoadButton
        .on('click', function(d) {
            //credit to https://jsfiddle.net/Ln37kqc0/
            var files = cat.controls.dataFileLoad.node().files;

            if (files.length <= 0) {
                //shouldn't happen since button is disabled when no file is present, but ...
                console.log('No file selected ...');
                return false;
            }

            var fr = new FileReader();
            fr.onload = function(e) {
                // get the current date/time
                var d = new Date();
                var n = d3.time.format('%X')(d);

                //make an object for the file
                var dataObject = {
                    label: files[0].name + ' (added at ' + n + ')',
                    user_loaded: true,
                    csv_raw: e.target.result
                };
                cat.config.dataFiles.push(dataObject);

                //add it to the select dropdown
                cat.controls.dataFileSelect
                    .append('option')
                    .datum(dataObject)
                    .text(d => d.label)
                    .attr('selected', true);

                //clear the file input & disable the load button
                loadStatus.text(files[0].name + ' loaded').style('color', 'green');

                cat.controls.dataFileLoadButton.attr('disabled', true);
                cat.controls.dataFileLoad.property('value', '');
            };

            fr.readAsText(files.item(0));
        });
}
