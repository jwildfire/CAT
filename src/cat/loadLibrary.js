import { scriptLoader } from "../util/scriptLoader";
import { loadRenderer } from "./loadRenderer";
import { getCSS } from "./env/getCSS";
import { getJS } from "./env/getJS";

export function loadLibrary(cat) {
  var version = cat.controls.libraryVersion.node().value;
  var library = "webcharts"; //hardcode to webcharts for now - could generalize later

  // --- load css --- //
  var cssPath =
    cat.config.rootURL +
    "/" +
    "webcharts" +
    "/" +
    version +
    "/" +
    "css" +
    "/" +
    "webcharts.css";

  var current_css = getCSS().filter(f => (f.link = cssPath));
  var css_loaded = current_css.length > 0;

  if (!css_loaded) {
    //load the css if it isn't already loaded
    var link = document.createElement("link");
    link.href = css_path;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
  } else if (current_css[0].disabled) {
    //enable the css if it's disabled
    d3.select(current_css[0].sel).property("disabled", false);
    cat.controls.cssList
      .selectAll("li")
      .filter(d => d.link == cssPath)
      .select("input")
      .property("checked", true);
  }

  // --- load js --- //
  var rendererPath =
    cat.config.rootURL +
    "/" +
    library +
    "/" +
    version +
    "/build/" +
    "webcharts" +
    ".js";

  var current_js = getJS().filter(f => f.link == rendererPath);
  console.log(current_js);
  var js_loaded = current_js.length > 0;

  if (!js_loaded) {
    var loader = new scriptLoader();
    loader.require(rendererPath, {
      async: true,
      success: function() {
        cat.status.loadStatus(
          cat.statusDiv,
          true,
          rendererPath,
          library,
          version
        );
        loadRenderer(cat);
      },
      failure: function() {
        cat.status.loadStatus(
          cat.statusDiv,
          false,
          rendererPath,
          library,
          version
        );
      }
    });
  } else {
    cat.status.loadStatus(cat.statusDiv, true, rendererPath, library, version);
    loadRenderer(cat);
  }
}
