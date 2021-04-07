/**
 * Amplitude plugin
 * @link https://getanalytics.io/plugins/amplitude/
 * @link https://amplitude.com/
 * @link https://developers.amplitude.com
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - Amplitude project API key
 * @param {string} pluginConfig.projectName - project name (if it's necessary to report to multiple projects)
 * @param {object} pluginConfig.options - Amplitude SDK options
 * @return {*}
 * @example
 *
 * amplitude({
 *   apiKey: 'token',
 *   options: { 
 *     trackingOptions: {
 *       ip_address: false 
 *     } 
 *   }
 * })
 */
export default function amplitudeBrowserPlugin (pluginConfig = {}) {
  // Amplitude client instance.
  let client = null;
  // Flag is set to true after amplitude client instance is initialized.
  let amplitudeInitCompleted = false;

  const scriptLoaded = (scriptSrc) => {
    const scripts = document.querySelectorAll('script[src]')
    return !!Object.keys(scripts).filter((key) => (scripts[key].src || '') === scriptSrc).length
  }

  const initComplete = (d) => {
    client = d;
    amplitudeInitCompleted = true;
  };

  return {
    name: "amplitude",
    config: pluginConfig,
    // For Amplitude options, see https://amplitude.github.io/Amplitude-JavaScript/Options
    initialize: ({ config }) => {
      const { apiKey, projectName, customScriptSrc, options = {} } = config;
      if (!apiKey) {
        throw new Error("Amplitude project API key is not defined");
      }
      if (options && typeof options !== "object") {
        throw new Error("Amplitude SDK options must be an object");
      }

      // Already loaded
      if (typeof window.amplitude !== 'undefined') {
        return;
      }
      
      const  scriptSrc = customScriptSrc ? customScriptSrc : 'https://cdn.amplitude.com/libs/amplitude-8.1.0-min.gz.js';

      (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
      ;r.type="text/javascript"
      ;r.integrity="sha384-u0hlTAJ1tNefeBKwiBNwB4CkHZ1ck4ajx/pKmwWtc+IufKJiCQZ+WjJIi+7C6Ntm"
      ;r.crossOrigin="anonymous";r.async=true
      ;r.src=scriptSrc
      ;r.onload=function(){if(!e.amplitude.runQueuedFunctions){
      console.log("[Amplitude] Error: could not load SDK")}}
      ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
      ;function s(e,t){e.prototype[t]=function(){
      this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
      var o=function(){this._q=[];return this}
      ;var a=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove"]
      ;for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[]
      ;return this}
      ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
      ;for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u
      ;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"]
      ;function v(e){function t(t){e[t]=function(){
      e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
      for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
      e=(!e||e.length===0?"$default_instance":e).toLowerCase()
      ;if(!Object.prototype.hasOwnProperty.call(n._iq,e)){n._iq[e]={_q:[]};v(n._iq[e])
      }return n._iq[e]};e.amplitude=n})(window,document);
    
      window.amplitude.init(config.apiKey, null, options, initComplete)
    },

    page: ({ payload: { properties, options } }) => {
      let eventType = "Page View"
      if (options && options.eventType) {
        eventType = options.eventType
      }
       client.logEvent(eventType, properties)
    },

    track: ({ payload: { event, properties } }) => {
       client.logEvent(event, properties)
    },

    identify: ({ payload: { userId, traits }, instance }) => {
      client.setDeviceId(instance.user("anonymousId"))
      client.setUserId(userId)
      client.setUserProperties(traits)
    },

    loaded: () => amplitudeInitCompleted,
  };
}
