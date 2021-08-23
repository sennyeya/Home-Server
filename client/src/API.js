import Config from './config';
import MessagingContext from './contexts/MessagingContext';

const setError = (resp) =>{
    return resp.json().then(data=>{if(MessagingContext.setMessage) MessagingContext.setMessage(data)})
                        .catch(err=>{if(MessagingContext.setMessage) MessagingContext.setMessage({message:err})})
}

const authOptions = {
    credentials:"include",
    mode: 'cors',
    headers:{
        'Accept':'application/json',
        'Content-Type':'application/json'
    }
}

/**
 * Server access class.
 * @property {Function} get Returns result of GET operation at requested URL.
 */
export default {
    /**
     * Simple API GET.
     * @param {String} url route to request, no leading '/'
     * @param {Object} params object with GET params, added to url.
     */
    get(url, params={}){
        return new Promise((res, rej)=>{
            params = Object.keys(params).map(e=>e+"="+params[e]).join("&")
            fetch(Config.api+url+(params?("?"+params):""), authOptions)
                .then(resp=>{
                    if(!resp.ok){
                        setError(resp);
                        return rej({resp:resp.statusText})
                    }
                    return resp.json()
                })
                .then(json=>res(json))
        })
    },

    /**
     * GET non-API route.
     * @param {String} route non API server route, leading '/' and trailing '/' or leading url '/'
     * @param {*} url post-route url, no leading '/'
     * @param {*} params 
     */
    getRoute(route, url, params={}){
        url = Config.api.replace("/api/","") + route.substring(1) + url
        return new Promise((res, rej)=>{
            params = Object.keys(params).map(e=>e+"="+params[e]).join("&")
            fetch(url+(params?("?"+params):""), authOptions)
                .then(resp=>{
                    if(!resp.ok){
                        setError(resp);
                        return rej({resp:resp.statusText})
                    }
                    return resp.json()
                })
                .then(json=>res(json))
        })
    },

    /**
     * Simple POST to API.
     * @param {String} url url for API request, no leading '/'.
     * @param {Object} params POST params, will be added to body of request.
     * @returns {Object} decoded json
     */
    post(url, params){
        return new Promise((res, rej)=>{
            fetch(Config.api + url,{
                credentials: 'include',
                method:"POST",
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(resp=>{
                if(!resp.ok){
                    setError(resp);
                    return rej({resp:resp.statusText})
                }
                return resp.json()
            })
            .then(json => res(json))
        })
    },

    /**
     * Posts to a custom route, not the API.
     * @param {String} route API route, include leading '/'
     * @param {String} url url after the route, no leading '/'
     * @param {Object} params POST parameters, will be added to body
     * @returns {Object} decoded json
     */
    postRoute(route, url, params){
        url = Config.api.replace("/api/","") + route.substring(1) + url
        return new Promise((res, rej)=>{
            fetch(url,{
                credentials: 'include',
                method:"POST",
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(resp=>{
                if(!resp.ok){
                    setError(resp);
                    return rej({resp:resp.statusText})
                }
                return resp.json()
            })
            .then(json => res(json))
        })
    },

    /**
     * XMLHTTPRequest to the desired endpoint with ArrayBuffer response.
     * @param {String} url url to request data from, does not need leading '/'
     * @param {Object} params GET additional parameters, will be added to URL
     * @returns {ArrayBuffer} raw data.
     */
    rawGet(url, params={}){
        params = Object.keys(params).map(e=>e+"="+params[e]).join("&")
        url = Config.api+url+(params?("?"+params):"");
        return new Promise((res, rej)=>{
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.withCredentials = true;

            oReq.onload = function (oEvent) {
                var arrayBuffer = oReq.response;
                if (arrayBuffer) {
                    return res(arrayBuffer)
                }
                return rej(oReq)
            };

            oReq.send(null);
        })
    }
}