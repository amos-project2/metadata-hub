export class Utilities {

    constructor() { }


    //use it like this:  let result = getUrlVars()["getVariable"];
    getUrlVars(urlLocation = window.location.href) {
       // if (urlLocation === null) {urlLocation = window.location.href;}
        let vars = {};
        let parts = urlLocation.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    //use it like this:  let result = getUrlParam('getVariable','defaultValue');
    getUrlParam(parameter, defaultvalue, urlLocation = window.location.href) {
       // if (urlLocation === null) {urlLocation = window.location.href;}

        let urlparameter = defaultvalue;
        if (urlLocation.indexOf(parameter+"=") > -1) {
            urlparameter = this.getUrlVars(urlLocation)[parameter];
        }
        return urlparameter;
    }

}
