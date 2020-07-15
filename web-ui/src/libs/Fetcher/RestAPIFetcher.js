export class RestAPIFetcher {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    //public
    fetchPost(path, formData, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "post",
            body: new URLSearchParams(formData)
        });

        this.fetchToResult(promise, callback);
    }

    restDelete(path, callback){
        let url = this.urlBuilder(path);
        $.ajax({
            url: url,
            type: 'DELETE',
            success: callback
        });
    }

    //public
    fetchGet(path, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "get",
        });

        this.fetchToResult(promise, callback);
    }

    //public
    fetchJson(path, jsonData, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "POST",
            body: JSON.stringify(jsonData),
            headers: {
                "Content-Type": "application/json"
            }
        });

        this.fetchToResult(promise, callback);
    }

    //public
    buildAndGetFormData() {
        //see https://developer.mozilla.org/de/docs/Web/API/FormData
        return new FormData();
    }


    //private
    urlBuilder(path) {
        return this.endpoint + "/" + path;
    }


    //private
    fetchToResult(promise, callback) {

        promise.then(function (response) {
            if (response.ok)
                return response.json();
            else {
                throw new Error('HTTP-ERROR: ' + response.statusText);
            }
        })
            .then(function (json) {
                try {
                    callback(new FetchResult(FetchResult.SUCCESS(), "", json))
                } catch (e) {
                    console.log(e);
                }
            })
            .catch(function (err) {
                if (err.message.includes("HTTP-ERROR: ")) {
                    callback(new FetchResult(FetchResult.HTTP_ERROR(), err.message, null));
                } else {
                    callback(new FetchResult(FetchResult.NETWORK_ERROR(), err.message, null));
                }

            });

    }


}

//its used by the callback function in the fetchers
export class FetchResult {

    static SUCCESS() {return 1;} //const
    static NETWORK_ERROR() {return 2;}//const
    static HTTP_ERROR() {return 3;}//const
    static AUTH_ERROR() {return 4;}//const
    static CRAWLER_NOT_REACHABLE() {return 5;}//const


    constructor(status, errorMessage, data) {
        this.status = status;
        this.errorMessage = errorMessage;
        this.data = data;
    }
}
