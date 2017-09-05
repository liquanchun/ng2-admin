import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Config } from '../providers/config';
import { GlobalState } from '../global.state';
@Injectable()
export class HttpService {
    private token: string;
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private baseUrl = 'api/';  // URL to web api
    constructor(private http: Http, public config: Config, private _state: GlobalState) {
        this.baseUrl = this.config.server + this.baseUrl;
    }

    getModelList(modelName: string): Promise<any[]> {
        const url = this.baseUrl + modelName;
        return this.http.get(this.newUrl(url))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getModel(modelName: string, id: any): Promise<any> {
        const url = `${this.baseUrl}${modelName}/${id}`;
        return this.http.get(this.newUrl(url))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    delete(modelName: string, id: any): Promise<void> {
        const url = `${this.baseUrl}${modelName}/${id}`;
        const that = this;
        return this.http.delete(this.newUrl(url), { headers: this.headers })
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    create(modelName: string, model: any): Promise<any> {
        const url = this.baseUrl + modelName;
        return this.http
            .post(this.newUrl(url), JSON.stringify(model), { headers: this.headers })
            .toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }

    update(modelName: string, modelId: any, model: any): Promise<any> {
        const url = `${this.baseUrl}${modelName}/${modelId}`;
        return this.http
            .put(this.newUrl(url), JSON.stringify(model), { headers: this.headers })
            .toPromise()
            .then(() => model)
            .catch(this.handleError);
    }

    handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error._body || 'Server error');
    }

    getHeaders() {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (this.token) {
            headers.append('Authorization', this.token);
        }
        return {
            headers: headers
        };
    }

    newUrl(url) {
        //  var getTimestamp=Math.random();
        const getTimestamp = new Date().getTime();
        if (url.indexOf('?') > -1) {
            url = `${url} &timestamp=${getTimestamp}`;
        } else {
            url = `${url}?timestamp=${getTimestamp}`;
        }
        return url;
    }

    setToken(token) {
        localStorage.setItem('ssid', token);
        this.token = token;
    }
}