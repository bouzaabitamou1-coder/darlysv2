(function () {
  // Find the <script data-tenant="..."> tag that loaded us
  var scripts = document.getElementsByTagName("script");
  var self = null, tenant = null, base = "";
  for (var i = 0; i < scripts.length; i++) {
    var s = scripts[i];
    if (s.src && s.src.indexOf("/embed/concierge.js") !== -1) {
      self = s;
      tenant = s.getAttribute("data-tenant");
      base = s.src.replace(/\/embed\/concierge\.js.*$/, "");
      break;
    }
  }
  if (!tenant) {
    console.error("[concierge] Missing data-tenant attribute on script tag.");
    return;
  }

  // Avoid double-injection
  if (document.getElementById("concierge-embed-iframe")) return;

  var iframe = document.createElement("iframe");
  iframe.id = "concierge-embed-iframe";
  iframe.src = base + "/embed/concierge?tenant=" + encodeURIComponent(tenant);
  iframe.setAttribute("title", "AI Concierge");
  iframe.setAttribute("allow", "clipboard-write");
  iframe.style.cssText = [
    "position:fixed",
    "bottom:0",
    "left:0",
    "width:420px",
    "max-width:100vw",
    "height:620px",
    "max-height:100vh",
    "border:0",
    "z-index:2147483647",
    "background:transparent",
    "color-scheme:light",
  ].join(";");
  document.body.appendChild(iframe);
})();