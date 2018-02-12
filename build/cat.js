(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
      ? define(factory)
      : (global.cat = factory());
})(this, function() {
  "use strict";

  function init() {
    //layout the cat
    this.wrap = d3
      .select(this.element)
      .append("div")
      .attr("class", "cat-wrap");
    this.layout(this);

    //initialize the settings
    this.setDefaults(this);

    //create the controls
    this.controls.init(this);
  }

  function layout(cat) {
    /* Layout primary sections */
    cat.controls.wrap = cat.wrap
      .append("div")
      .attr("class", "cat-controls section");
    cat.chartWrap = cat.wrap.append("div").attr("class", "cat-chart section");
    cat.dataWrap = cat.wrap.append("div").attr("class", "cat-data footer");

    /* Layout CAT Controls Divs */
    cat.controls.submitWrap = cat.controls.wrap
      .append("div")
      .attr("class", "control-section submit-section");

    cat.controls.rendererWrap = cat.controls.wrap
      .append("div")
      .attr("class", "control-section renderer-section");

    cat.controls.dataWrap = cat.controls.wrap
      .append("div")
      .attr("class", "control-section data-section");

    cat.controls.settingsWrap = cat.controls.wrap
      .append("div")
      .attr("class", "control-section settings-section");

    cat.controls.environmentWrap = cat.controls.wrap
      .append("div")
      .attr("class", "control-section environment-section");
  }

  function initRendererSelect(cat) {
    cat.controls.rendererWrap.append("h3").text("1. Choose a Charting Library");
    cat.controls.rendererWrap.append("span").text("Library: ");

    cat.controls.rendererSelect = cat.controls.rendererWrap.append("select");
    cat.controls.rendererSelect
      .selectAll("option")
      .data(cat.config.renderers)
      .enter()
      .append("option")
      .text(function(d) {
        return d.name;
      });
    var rendererSection = cat.controls.wrap
      .append("div")
      .attr("class", "control-section section2");

    cat.controls.rendererSelect.on("change", function(d) {
      cat.current = d3
        .select(this)
        .select("option:checked")
        .data()[0];

      //update the chart type configuration to the defaults for the selected renderer
      cat.controls.mainFunction.node().value = cat.current.main;
      cat.controls.versionSelect.node().value = "master";
      cat.controls.subFunction.node().value = cat.current.sub;
      cat.controls.schema.node().value = cat.current.schema;

      //update the selected data set to the default for the new rendererSection
      cat.controls.dataFileSelect
        .selectAll("option")
        .property("selected", function(e) {
          return cat.current.defaultData == e ? true : null;
        });

      //Re-initialize the chart config section
      cat.settings.set(cat);
    });
    cat.controls.rendererSelect
      .node()
      .addEventListener("keypress", function(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
          // 13 is enter
          cat.controls.submitButton.node().click();
        }
      });

    rendererSection.append("span").text("Version: ");
    cat.controls.versionSelect = rendererSection.append("input");
    cat.controls.versionSelect.node().value = "master";
    cat.controls.versionSelect.on("change", function() {
      //checkVersion()
      cat.settings.set(cat);
    });
    cat.controls.versionSelect.node().addEventListener("keypress", function(e) {
      var key = e.which || e.keyCode;
      if (key === 13) {
        // 13 is enter
        cat.controls.submitButton.node().click();
      }
    });
    rendererSection.append("br");

    rendererSection
      .append("a")
      .text("More Options")
      .style("text-decoration", "underline")
      .style("color", "blue")
      .style("cursor", "pointer")
      .on("click", function() {
        d3.select(this).remove();
        rendererSection.selectAll("*").classed("hidden", false);
      });

    //specify the code to create the chart
    rendererSection
      .append("span")
      .text(" Init: ")
      .classed("hidden", true);
    cat.controls.mainFunction = rendererSection
      .append("input")
      .classed("hidden", true);
    cat.controls.mainFunction.node().value = cat.current.main;
    rendererSection
      .append("span")
      .text(".")
      .classed("hidden", true);
    cat.controls.subFunction = rendererSection
      .append("input")
      .classed("hidden", true);
    cat.controls.subFunction.node().value = cat.current.sub;
    rendererSection.append("br").classed("hidden", true);
    //Webcharts versionSelect
    rendererSection
      .append("span")
      .text("Webcharts Version: ")
      .classed("hidden", true);
    cat.controls.libraryVersion = rendererSection
      .append("input")
      .classed("hidden", true);
    cat.controls.libraryVersion.node().value = "master";
    rendererSection.append("br").classed("hidden", true);

    rendererSection
      .append("span")
      .text("Schema: ")
      .classed("hidden", true);
    cat.controls.schema = rendererSection
      .append("input")
      .classed("hidden", true);
    cat.controls.schema.node().value = cat.current.schema;
    rendererSection.append("br").classed("hidden", true);
  }

  function initDataSelect(cat) {
    cat.controls.dataWrap.append("h3").text("2. Choose a data Set");

    cat.controls.dataFileSelect = cat.controls.dataWrap.append("select");
    cat.controls.dataFileSelect
      .selectAll("option")
      .data(cat.config.dataFiles)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      });
    cat.controls.dataFileSelect
      .node()
      .addEventListener("keypress", function(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
          // 13 is enter
          cat.controls.submitButton.node().click();
        }
      });
  }

  function initFileLoad() {
    var cat = this;
    //draw the control

    cat.controls.dataFileLoad = cat.controls.dataWrap
      .append("input")
      .attr("type", "file")
      .attr("class", "file-load-input");
    cat.controls.dataFileLoadButton = cat.controls.dataWrap
      .append("button")
      .text("Load File")
      .attr("class", "file-load-button")
      .on("click", function(d) {
        console.log("you loaded a file");
        console.log(cat.controls.dataFileLoad.node());
      });
    //when a file is uploaded, add it to the data select dropdown
  }

  function initChartConfig(cat) {
    var settingsHeading = cat.controls.settingsWrap
      .append("h3")
      .html("3. Customize the Chart ");

    cat.controls.settingsWrap.append("span").text("Settings: ");

    /*
  //////////////////////////////////////
  //initialize the config status icon
  //////////////////////////////////////
  cat.controls.settingsStatus = settingsSection
    .append("div")
    .style("font-size", "1.5em")
    .style("float", "right")
    .style("cursor", "pointer");
  settingsSection.append("br");
  */

    //////////////////////////////////////////////////////////////////////
    //radio buttons to toggle between "text" and "form" based settings
    /////////////////////////////////////////////////////////////////////
    cat.controls.settingsTypeText = cat.controls.settingsWrap
      .append("input")
      .attr("class", "radio")
      .property("type", "radio")
      .property("name", "settingsType")
      .property("value", "text");
    cat.controls.settingsWrap.append("span").text("text");
    cat.controls.settingsTypeForm = cat.controls.settingsWrap
      .append("input")
      .attr("class", "radio")
      .property("type", "radio")
      .property("name", "settingsType")
      .property("value", "form");
    cat.controls.settingsWrap.append("span").text("form");
    cat.controls.settingsType = cat.controls.settingsWrap.selectAll(
      'input[type="radio"]'
    );

    cat.controls.settingsType.on("change", function(d) {
      cat.settings.sync(cat); //first sync the current settings to both views

      //then update to the new view, and update controls.
      cat.current.settingsView = this.value; //
      if (cat.current.settingsView == "text") {
        cat.controls.settingsInput.classed("hidden", false);
        cat.controls.settingsForm.classed("hidden", true);
      } else if (cat.current.settingsView == "form") {
        cat.controls.settingsInput.classed("hidden", true);
        cat.controls.settingsForm.classed("hidden", false);
      }
    });
    cat.controls.settingsWrap.append("br");

    //////////////////////////////////////////////////////////////////////
    //text input section
    /////////////////////////////////////////////////////////////////////
    cat.controls.settingsInput = cat.controls.settingsWrap
      .append("textarea")
      .attr("rows", 10)
      .style("width", "90%")
      .text("{}");
    cat.controls.settingsInput.node().addEventListener("keypress", function(e) {
      var key = e.which || e.keyCode;
      if (key === 13) {
        // 13 is enter
        cat.controls.submitButton.node().click();
      }
    });

    //////////////////////////////////////////////////////////////////////
    //wrapper for the form
    /////////////////////////////////////////////////////////////////////
    cat.controls.settingsForm = cat.controls.settingsWrap
      .append("div")
      .attr("class", "settingsForm")
      .append("form");

    //set the text/form settings for the first renderer
    cat.settings.set(cat);
  }

  var _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
      ? function(obj) {
          return typeof obj;
        }
      : function(obj) {
          return obj &&
            typeof Symbol === "function" &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
            ? "symbol"
            : typeof obj;
        };

  var asyncGenerator = (function() {
    function AwaitValue(value) {
      this.value = value;
    }

    function AsyncGenerator(gen) {
      var front, back;

      function send(key, arg) {
        return new Promise(function(resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };

          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;

          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(
              function(arg) {
                resume("next", arg);
              },
              function(arg) {
                resume("throw", arg);
              }
            );
          } else {
            settle(result.done ? "return" : "normal", result.value);
          }
        } catch (err) {
          settle("throw", err);
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;

          case "throw":
            front.reject(value);
            break;

          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }

        front = front.next;

        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }

      this._invoke = send;

      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }

    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
        return this;
      };
    }

    AsyncGenerator.prototype.next = function(arg) {
      return this._invoke("next", arg);
    };

    AsyncGenerator.prototype.throw = function(arg) {
      return this._invoke("throw", arg);
    };

    AsyncGenerator.prototype.return = function(arg) {
      return this._invoke("return", arg);
    };

    return {
      wrap: function(fn) {
        return function() {
          return new AsyncGenerator(fn.apply(this, arguments));
        };
      },
      await: function(value) {
        return new AwaitValue(value);
      }
    };
  })();

  // Nice script loader from here: https://stackoverflow.com/questions/538745/how-to-tell-if-a-script-tag-failed-to-load

  function scriptLoader() {}

  scriptLoader.prototype = {
    timer: function timer(
      times, // number of times to try
      delay, // delay per try
      delayMore, // extra delay per try (additional to delay)
      test, // called each try, timer stops if this returns true
      failure, // called on failure
      result // used internally, shouldn't be passed
    ) {
      var me = this;
      if (times == -1 || times > 0) {
        setTimeout(function() {
          result = test() ? 1 : 0;
          me.timer(
            result ? 0 : times > 0 ? --times : times,
            delay + (delayMore ? delayMore : 0),
            delayMore,
            test,
            failure,
            result
          );
        }, result || delay < 0 ? 0.1 : delay);
      } else if (typeof failure == "function") {
        setTimeout(failure, 1);
      }
    },

    addEvent: function addEvent(el, eventName, eventFunc) {
      if ((typeof el === "undefined" ? "undefined" : _typeof(el)) != "object") {
        return false;
      }

      if (el.addEventListener) {
        el.addEventListener(eventName, eventFunc, false);
        return true;
      }

      if (el.attachEvent) {
        el.attachEvent("on" + eventName, eventFunc);
        return true;
      }

      return false;
    },

    // add script to dom
    require: function require(url, args) {
      var me = this;
      args = args || {};

      var scriptTag = document.createElement("script");
      var headTag = document.getElementsByTagName("head")[0];
      if (!headTag) {
        return false;
      }

      setTimeout(function() {
        var f =
          typeof args.success == "function" ? args.success : function() {};
        args.failure =
          typeof args.failure == "function" ? args.failure : function() {};
        var fail = function fail() {
          if (!scriptTag.__es) {
            scriptTag.__es = true;
            scriptTag.id = "failed";
            args.failure(scriptTag);
          }
        };
        scriptTag.onload = function() {
          scriptTag.id = "loaded";
          f(scriptTag);
        };
        scriptTag.type = "text/javascript";
        scriptTag.async = typeof args.async == "boolean" ? args.async : false;
        scriptTag.charset = "utf-8";
        me.__es = false;
        me.addEvent(scriptTag, "error", fail); // when supported
        // when error event is not supported fall back to timer
        me.timer(
          15,
          1000,
          0,
          function() {
            return scriptTag.id == "loaded";
          },
          function() {
            if (scriptTag.id != "loaded") {
              fail();
            }
          }
        );
        scriptTag.src = url;
        setTimeout(function() {
          try {
            headTag.appendChild(scriptTag);
          } catch (e) {
            fail();
          }
        }, 1);
      }, typeof args.delay == "number" ? args.delay : 1);
      return true;
    }
  };

  function createChartExport(cat) {
    /* Get settings from current controls */
    var webcharts_version = cat.controls.libraryVersion.node().value;
    var renderer_version = cat.controls.versionSelect.node().value;
    var data_file = cat.controls.dataFileSelect.node().value;
    var data_file_path = cat.config.dataURL + data_file;
    var init_string = cat.current.sub
      ? cat.current.main + "." + cat.current.sub
      : cat.current.main;

    var chart_config = JSON.stringify(cat.current.config, null, " ");
    var renderer_css = "";
    if (cat.current.css) {
      var css_path =
        cat.config.rootURL +
        "/" +
        cat.current.name +
        "/" +
        renderer_version +
        "/" +
        cat.current.css;
      renderer_css =
        "<link type = 'text/css' rel = 'stylesheet' href = '" + css_path + "'>";
    }

    /* Return a html for a working chart */
    var exampleTemplate =
      "\n<!DOCTYPE html>\n\n    <html>\n\n    <head>\n        <title>" +
      cat.current.name +
      "</title>\n\n        <meta http-equiv = 'Content-Type' content = 'text/html; charset = utf-8'>\n\n        <script type = 'text/javascript' src = 'https://d3js.org/d3.v3.min.js'></script>\n        <script type = 'text/javascript' src = 'https://rawgit.com/RhoInc/Webcharts/" +
      webcharts_version +
      "/build/webcharts.js'></script>\n        <script type = 'text/javascript' src = 'https://rawgit.com/RhoInc/" +
      cat.current.name +
      "/" +
      renderer_version +
      "/build/" +
      cat.current.main +
      ".js'></script>\n\n        <link type = 'text/css' rel = 'stylesheet' href = 'https://rawgit.com/RhoInc/Webcharts/" +
      webcharts_version +
      "/css/webcharts.min.css'>\n        " +
      renderer_css +
      "\n    </head>\n\n    <body>\n        <h1 id = 'title'>" +
      cat.current.name +
      " created for " +
      cat.current.defaultData +
      "</h1>\n        <div id = 'container'>\n        </div>\n    </body>\n\n    <script type = 'text/javascript'>\n        let settings = " +
      chart_config +
      "\n        let chart = " +
      init_string +
      "('#container', settings);\n        d3.csv('" +
      data_file_path +
      "', function(data) {\n            chart.init(data);\n        });\n\n    </script>\n</html>\n";
    return exampleTemplate;
  }

  function renderChart(cat) {
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
        cat.status.loadStatus(cat.statusDiv, false, dataFilePath);
      } else {
        cat.status.loadStatus(cat.statusDiv, true, dataFilePath);
        if (cat.current.sub) {
          var myChart = window[cat.current.main][cat.current.sub](
            ".cat-chart",
            cat.current.config
          );
          cat.status.chartCreateStatus(
            cat.statusDiv,
            cat.current.main,
            cat.current.sub
          );
        } else {
          var myChart = window[cat.current.main](
            ".cat-chart .chart",
            cat.current.config
          );
          cat.status.chartCreateStatus(cat.statusDiv, cat.current.main);
        }

        cat.current.htmlExport = createChartExport(cat); // save the source code before init

        try {
          myChart.init(data);
        } catch (err) {
          cat.status.chartInitStatus(cat.statusDiv, false, err);
        } finally {
          cat.status.chartInitStatus(
            cat.statusDiv,
            true,
            null,
            cat.current.htmlExport
          );

          // save to server button
          if (cat.config.useServer) {
            cat.status.saveToServer(cat);
          }

          //don't print any new statuses until a new chart is rendered
          cat.printStatus = false;
        }
      }
    });
  }

  function loadRenderer(cat) {
    var rendererObj = cat.controls.rendererSelect
      .selectAll("option:checked")
      .data()[0];
    var version = cat.controls.versionSelect.node().value;
    var rendererPath =
      cat.config.rootURL +
      "/" +
      rendererObj.name +
      "/" +
      version +
      "/build/" +
      rendererObj.main +
      ".js";

    if (rendererObj.css) {
      var link = document.createElement("link");
      link.href =
        cat.config.rootURL +
        "/" +
        rendererObj.name +
        "/" +
        version +
        "/" +
        rendererObj.css;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(link);
    }

    var loader = new scriptLoader();
    loader.require(rendererPath, {
      async: true,
      success: function success() {
        cat.status.loadStatus(
          cat.statusDiv,
          true,
          rendererPath,
          rendererObj.name,
          version
        );
        renderChart(cat);
      },
      failure: function failure() {
        cat.status.loadStatus(
          cat.statusDiv,
          false,
          rendererPath,
          rendererObj.name,
          version
        );
      }
    });
  }

  function loadBootstrap(cat) {
    var bootstrapPath_css =
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    var bootstrapPath_js =
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js";

    var link = document.createElement("link");
    link.href = bootstrapPath_css;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var bootstrapLoader = new scriptLoader();
    bootstrapLoader.require(bootstrapPath_js, {
      async: true,
      success: function success() {
        cat.statusDiv.append("div").html("Loaded bootstrap.");

        loadRenderer(cat);
      },
      failure: function failure() {
        cat.statusDiv
          .append("div")
          .html("The " + version + "Couldn't load bootstrap. Aborting.")
          .classed("error", true);
      }
    });
  }

  function initBootstrapConfig(cat) {
    var settingsHeading = cat.controls.environmentWrap
      .append("h3")
      .html("4. Environment ");

    cat.controls.bootstrapButton = cat.controls.environmentWrap
      .append("button")
      .text("Load Bootstrap")
      .on("click", function() {
        loadBootstrap(cat);
      });

    cat.controls.environmentWrap
      .append("div")
      .append("small")
      .text(
        "Load bootstrap with the button above. Refresh the page if you want to remove bootstrap."
      );
  }

  function loadLibrary(cat) {
    var version = cat.controls.libraryVersion.node().value;
    var library = "webcharts"; //hardcode to webcharts for now - could generalize later
    var rendererPath =
      cat.config.rootURL +
      "/" +
      library +
      "/" +
      version +
      "/build/" +
      "webcharts" +
      ".js";

    var link = document.createElement("link");
    link.href =
      cat.config.rootURL +
      "/" +
      "webcharts" +
      "/" +
      version +
      "/" +
      "css" +
      "/" +
      "webcharts.css";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var loader = new scriptLoader();
    loader.require(rendererPath, {
      async: true,
      success: function success() {
        cat.status.loadStatus(
          cat.statusDiv,
          true,
          rendererPath,
          library,
          version
        );
        loadRenderer(cat);
      },
      failure: function failure() {
        cat.status.loadStatus(
          cat.statusDiv,
          false,
          rendererPath,
          library,
          version
        );
      }
    });
  }

  function initSubmit(cat) {
    cat.controls.submitButton = cat.controls.submitWrap
      .append("button")
      .attr("class", "submit")
      .text("Render Chart")
      .on("click", function() {
        //Disable and/or remove previously loaded stylesheets.
        d3
          .selectAll("link")
          .filter(function() {
            return !this.href.indexOf("css/cat.css");
          })
          .property("disabled", true)
          .remove();
        d3
          .selectAll("style")
          .property("disabled", true)
          .remove();

        cat.chartWrap.selectAll("*").remove();
        cat.printStatus = true;
        cat.statusDiv = cat.chartWrap.append("div").attr("class", "status");
        cat.statusDiv
          .append("div")
          .text("Starting to render the chart ... ")
          .classed("info", true);

        cat.chartWrap.append("div").attr("class", "chart");
        loadLibrary(cat);
      });
  }

  function init$1(cat) {
    cat.current = cat.config.renderers[0];
    cat.controls.wrap.append("h2").text("Charting Application Tester 😼");
    initSubmit(cat);
    initRendererSelect(cat);
    initDataSelect(cat);
    initFileLoad.call(cat);
    initChartConfig(cat);
    initBootstrapConfig(cat);

    // minimize controls - for later?
    /*
  cat.controls.minimize = controlWrap
    .append("div")
    .attr("class", "minimize")
    .text("<<")
    .style("float", "left")
    .on("click", function() {
      cat.controls.wrap.classed("hidden", true);
      cat.wrap
        .insert("div", ":first-child")
        .attr("class", "maximize")
        .text(">>")
        .on("click", function() {
          cat.controls.wrap.classed("hidden", false);
          d3.select(this).remove();
        });
    });
  */
  }

  /*------------------------------------------------------------------------------------------------\
  Define controls object.
\------------------------------------------------------------------------------------------------*/

  var controls = {
    init: init$1
  };

  var defaultSettings = {
    useServer: false,
    rootURL: "https://cdn.rawgit.com/RhoInc",
    dataURL: "https://rhoinc.github.io/viz-library/data/",
    dataFiles: [
      "safetyData-queries/ADAE.csv",
      "safetyData-queries/ADBDS.csv",
      "safetyData/ADAE.csv",
      "safetyData/ADBDS.csv",
      "safetyData/ADTIMELINES.csv",
      "safetyData/ADCM.csv",
      "safetyData/SDTM/DM.csv",
      "safetyData/SDTM/AE.csv",
      "safetyData/SDTM/CM.csv",
      "safetyData/SDTM/SV.csv",
      "safetyData/SDTM/LB.csv",
      "safetyData/SDTM/VS.csv",
      "queries/queries.csv",
      "cars.csv",
      "climate_data.csv",
      "discrete_score.csv",
      "elements.csv",
      "ChickWeight.csv"
    ],
    renderers: [
      {
        name: "aeexplorer",
        main: "aeTable",
        sub: "createChart",
        css: "css/aeTable.css",
        schema: "settings-schema.json",
        defaultData: "safetyData/ADAE.csv"
      },
      {
        name: "clinical-timelines",
        main: "clinicalTimelines",
        sub: null,
        css: null,
        schema: "settings-schema.json",
        defaultData: "safetyData/ADTIMELINES.csv"
      },
      {
        name: "web-codebook",
        main: "webcodebook",
        sub: "createChart",
        css: "css/webcodebook.css",
        schema: null,
        defaultData: "safetyData/ADAE.csv"
      },
      {
        name: "aetimelines",
        main: "aeTimelines",
        sub: null,
        css: null,
        schema: null,
        defaultData: "safetyData/ADAE.csv"
      },
      {
        name: "paneled-outlier-explorer",
        main: "paneledOutlierExplorer",
        sub: null,
        css: null,
        schema: "settings-schema.json",
        defaultData: "safetyData/ADBDS.csv"
      },
      {
        name: "safety-histogram",
        main: "safetyHistogram",
        sub: null,
        css: null,
        schema: null,
        defaultData: "safetyData/ADBDS.csv"
      },
      {
        name: "safety-outlier-explorer",
        main: "safetyOutlierExplorer",
        sub: null,
        css: null,
        schema: "settings-schema.json",
        defaultData: "safetyData/ADBDS.csv"
      },
      {
        name: "safety-results-over-time",
        main: "safetyResultsOverTime",
        sub: null,
        css: null,
        schema: "settings-schema.json",
        defaultData: "safetyData/ADBDS.csv"
      },
      {
        name: "safety-shift-plot",
        main: "safetyShiftPlot",
        sub: null,
        css: null,
        schema: null,
        defaultData: "safetyData/ADBDS.csv"
      },
      {
        name: "query-overview",
        main: "queryOverview",
        sub: null,
        css: null,
        schema: null,
        defaultData: "queries/queries.csv"
      }
    ]
  };

  function setDefaults(cat) {
    cat.config.useServer = cat.config.useServer || defaultSettings.useServer;
    cat.config.rootURL = cat.config.rootURL || defaultSettings.rootURL;
    cat.config.dataURL = cat.config.dataURL || defaultSettings.dataURL;
    cat.config.dataFiles = cat.config.dataFiles || defaultSettings.dataFiles;
    cat.config.renderers = cat.config.renderers || defaultSettings.renderers;
  }

  function makeForm(cat, obj) {
    var formLayout = [
      {
        type: "actions",
        items: [
          {
            type: "submit",
            title: "Submit"
          }
        ]
      },
      "*"
    ];

    d3
      .select(".settingsForm form")
      .selectAll("*")
      .remove();
    var myForm = $(".settingsForm form").jsonForm({
      schema: cat.current.schemaObj,
      value: obj,
      form: formLayout,
      onSubmit: function onSubmit(errors, values) {
        if (errors) {
          if (cat.printStatus) {
            cat.statusDiv
              .append("div")
              .html(
                "Attempted to load settings from json-schema form, but there might be a problem ..."
              )
              .classed("error", true);
          }
          //cat.settings.setStatus(cat, "invalid");
          cat.current.config = values;
          cat.controls.settingsInput.node().value = JSON.stringify(
            cat.current.config
          );
        } else {
          //cat.settings.setStatus(cat, "valid");
          if (cat.printStatus) {
            cat.statusDiv
              .append("div")
              .html("Successfully loaded settings from the json-schema form.")
              .classed("success", true);
          }
          cat.current.config = values;
          cat.controls.settingsInput.node().value = JSON.stringify(
            cat.current.config
          );
        }
      }
    });
    //handle submission with the "render chart" button
    d3.select(".settingsForm form .form-actions input").remove();
    //format the form a little bit so that we can dodge bootstrap
    d3.selectAll("i.icon-plus-sign").text("+");
    d3.selectAll("i.icon-minus-sign").text("-");
    d3.selectAll(".settingsForm input, .settingsForm select").each(function() {
      this.addEventListener("keypress", function(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
          // 13 is enter
          cat.controls.submitButton.node().click();
        }
      });
    });
  }

  function setStatus(cat, statusVal) {
    var statusOptions = [
      {
        key: "valid",
        symbol: "&#x2714;",
        color: "green",
        details:
          "Settings match the current schema. Click 'Render Chart' to draw the chart."
      },
      {
        key: "invalid",
        symbol: "&#x2718;",
        color: "red",
        details:
          "Settings do not match the current schema. You can still click 'Render Chart' to try to draw the chart, but it might not work as expected."
      },
      {
        key: "unknown",
        symbol: "?",
        color: "blue",
        details:
          "You've loaded a schema, but the setting have changed. Click 'Validate Settings' to see if they're valid or you can click 'Render Chart' and see what happens."
      },
      {
        key: "no schema",
        symbol: "NA",
        color: "#999",
        details:
          "No Schema loaded. Cannot validate the current settings. You can click 'Render Chart' and see what happens."
      }
    ];

    var myStatus = statusOptions.filter(function(d) {
      return d.key == statusVal;
    })[0];

    cat.controls.settingsStatus
      .html(myStatus.symbol)
      .style("color", myStatus.color)
      .attr("title", myStatus.details);
  }

  function validateSchema(cat) {
    // consider: http://epoberezkin.github.io/ajv/#getting-started
    //  var Ajv = require('ajv');
    //  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    //  var validate = ajv.compile(cat.);
    return true;
  }

  function set$1(cat) {
    // load the schema (if any) and see if it is validate
    var version = cat.controls.versionSelect.node().value;
    var schemaPath =
      cat.config.rootURL +
      "/" +
      cat.current.name +
      "/" +
      version +
      "/" +
      cat.current.schema;
    d3.json(schemaPath, function(error, schemaObj) {
      //d3.json(testPath, function(error, schemaObj) {
      if (error) {
        console.log("No schema loaded.");
        cat.current.hasValidSchema = false;
        cat.current.settingsView = "text";
        cat.current.schemaObj = null;
        cat.controls.settingsInput.value = "{}";
        cat.current.config = {};
        //cat.settings.setStatus(cat, "no schema");
      } else {
        // attempt to validate the schema
        console.log("Schema found ...");
        cat.current.hasValidSchema = validateSchema(schemaObj);
        cat.current.settingsView = cat.current.hasValidSchema ? "form" : "text";
        cat.current.schemaObj = cat.current.hasValidSchema ? schemaObj : null;
        //  cat.settings.setStatus(
        //    cat,
        //    cat.current.hasValidSchema ? "unknown" : "no schema"
        //  );
      }
      //set the radio buttons
      cat.controls.settingsTypeText.property(
        "checked",
        cat.current.settingsView == "text"
      );

      cat.controls.settingsTypeForm
        .property("checked", cat.current.settingsView == "form")
        .property("disabled", !cat.current.hasValidSchema);

      // Show/Hide sections
      cat.controls.settingsInput.classed(
        "hidden",
        cat.current.settingsView != "text"
      );
      cat.controls.settingsForm.classed(
        "hidden",
        cat.current.settingsView != "form"
      );
      //update the text or make the schema

      cat.controls.settingsInput.node().value = JSON5.stringify(
        cat.current.config
      );

      if (cat.current.hasValidSchema) {
        console.log("... and it is valid. Making a nice form.");
        makeForm(cat);
      }
    });
  }

  function sync(cat, printStatus) {
    function IsJsonString(str) {
      try {
        JSON5.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    // set current config
    if (cat.current.settingsView == "text") {
      var jsonText = cat.controls.settingsInput.node().value;
      if (IsJsonString(jsonText)) {
        if (cat.printStatus) {
          cat.statusDiv
            .append("div")
            .html("Successfully loaded settings from text input.")
            .classed("success", true);
        }
        cat.controls.settingsInput.node().value = JSON.stringify(
          JSON5.parse(jsonText)
        );
        cat.current.config = JSON5.parse(jsonText);
      } else {
        if (cat.printStatus) {
          cat.statusDiv
            .append("div")
            .html(
              "Couldn't load settings from text. Check to see if you have <a href='https://jsonlint.com/?json=" +
                jsonText +
                "'>valid json</a>."
            )
            .classed("error", true);
        }
      }

      if (cat.current.hasValidSchema) {
        makeForm(cat, cat.current.config);
      }
    } else if (cat.current.settingsView == "form") {
      //this submits the form which:
      //- saves the current object
      //- updates the hidden text view
      $(".settingsForm form").trigger("submit");
    }
  }

  /*------------------------------------------------------------------------------------------------\
  Define controls object.
\------------------------------------------------------------------------------------------------*/

  var settings = {
    set: set$1,
    sync: sync,
    setStatus: setStatus
  };

  function chartCreateStatus(statusDiv, main, sub) {
    var message = sub
      ? "Created the chart by calling <i>" + main + "." + sub + "()</i>."
      : "Created the chart by calling <i>" + main + "()</i>.";

    statusDiv
      .append("div")
      .html(message)
      .classed("info", true);
  }

  function chartInitStatus(statusDiv, success, err, htmlExport) {
    if (success) {
      //hide all non-error statuses
      statusDiv.selectAll("div:not(.error)").classed("hidden", true);

      // Print basic success message
      statusDiv
        .append("div")
        .attr("class", "initSuccess")
        .html(
          "All Done. Your chart should be below. <span class='showLog'>Show full log</span>"
        )
        .classed("info", true);

      //Click to show all statuses
      statusDiv
        .select("div.initSuccess")
        .select("span.showLog")
        .style("cursor", "pointer")
        .style("text-decoration", "underline")
        .style("float", "right")
        .on("click", function() {
          d3.select(this).remove();
          statusDiv.selectAll("div").classed("hidden", false);
        });

      //generic caution (hidden by default)
      statusDiv
        .append("div")
        .classed("hidden", true)
        .classed("info", true)
        .html(
          "&#9432; Just because there are no errors doesn't mean there can't be problems. If things look strange, it might be a problem with the settings/data combo or with the renderer itself."
        );

      //export source code (via copy/paste)
      statusDiv
        .append("div")
        .classed("hidden", true)
        .classed("export", true)
        .classed("minimized", true)
        .html("Click to see chart's full source code");

      statusDiv.select("div.export.minimized").on("click", function() {
        d3.select(this).classed("minimized", false);
        d3.select(this).html("<strong>Source code for chart:</strong>");
        d3
          .select(this)
          .append("code")
          .html(
            htmlExport
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br/>")
              .replace(/ /g, "&nbsp;")
          );
      });
    } else {
      //if init fails (success == false)
      statusDiv
        .append("div")
        .html(
          "There might've been some problems initializing the chart. Errors include:<br><small><i>" +
            err +
            "</i></small>"
        )
        .classed("error", true);
    }
  }

  function saveToServer(cat) {
    var serverDiv = cat.statusDiv
      .append("div")
      .attr("class", "info")
      .text("Enter your name and click save for a reusable URL. ");
    var nameInput = serverDiv.append("input").property("placeholder", "Name");
    var saveButton = serverDiv
      .append("button")
      .text("Save")
      .property("disabled", true);

    nameInput.on("input", function() {
      saveButton.property("disabled", nameInput.node().value.length == 0);
    });

    saveButton.on("click", function() {
      //remove the form
      d3.select(this).remove();
      nameInput.remove();

      //format an object for the post
      var dataFile = cat.controls.dataFileSelect.node().value;
      var dataFilePath = cat.config.dataURL + dataFile;
      var chartObj = {
        name: nameInput.node().value,
        renderer: cat.current.name,
        version: cat.controls.versionSelect.node().value,
        dataFile: dataFilePath,
        chart: btoa(cat.current.htmlExport)
      };

      //post the object, get a URL back
      $.post("./export/", chartObj, function(data) {
        serverDiv.html(
          "Chart saved as <a href='" + data.url + "'>" + data.url + "</a>"
        );
      }).fail(function() {
        serverDiv
          .text("Sorry. Couldn't save the chart.")
          .classed("error", true);
        console.warn("Error :( Something went wrong saving the chart.");
      });
    });
  }

  function loadStatus(statusDiv, passed, path, library, version) {
    var message = passed
      ? "Successfully loaded " + path
      : "Failed to load " + path;

    if ((library != undefined) & (version != undefined))
      message =
        message + " (Library: " + library + ", Version: " + version + ")";

    statusDiv
      .append("div")
      .html(message)
      .classed("error", !passed);
  }

  /*------------------------------------------------------------------------------------------------\
  Define controls object.
\------------------------------------------------------------------------------------------------*/

  var status = {
    chartCreateStatus: chartCreateStatus,
    chartInitStatus: chartInitStatus,
    saveToServer: saveToServer,
    loadStatus: loadStatus
  };

  function createCat() {
    var element =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : "body";
    var config = arguments[1];

    var cat = {
      element: element,
      config: config,
      init: init,
      layout: layout,
      controls: controls,
      setDefaults: setDefaults,
      settings: settings,
      status: status
    };

    return cat;
  }

  var index = {
    createCat: createCat
  };

  return index;
});
