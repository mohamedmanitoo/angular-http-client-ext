import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IObservableBase {
    
}

export interface IObservable<T> extends IObservableBase {
    (subscribe: ISubscribe<T>) : void;    
}

export interface IObservableError extends IObservableBase {
    (error: ISubscribeError) : void;
}

export interface ISubscribeBase {
    ok: boolean;
    headers: HttpHeaders;
    status: number;
    statusText: string;    
}

export interface ISubscribe<T> extends ISubscribeBase {
    ok: boolean;
    body: T;
    headers: HttpHeaders;
}

export class Subscribe<T> implements ISubscribe<T> {
    ok: boolean;
    body: T;
    headers: HttpHeaders;
    status: number;
    statusText: string;
}

export interface ISubscribeError extends ISubscribeBase {
    message: string;
    status: number;
    statusText: string;
}

export class SubscribeError implements ISubscribeError {
    ok: boolean;
    headers: HttpHeaders;
    message: string;
    status: number;
    statusText: string;
}

export interface IHttpClientExtended {
    get<T>(url: string, success?: IObservable<T>, failure?: IObservableError, options?: any) : Observable<HttpResponse<T>>;

    post<TRequest, TResponse>(url: string, model: TRequest, 
                              success?: IObservable<TResponse>, 
                              failure?: IObservableError, options?: any) : Observable<HttpResponse<TResponse>>;
}

@Injectable({
  providedIn: 'root'
})
export class HttpClientExt implements IHttpClientExtended {

    constructor(private client: HttpClient)
    {
    }

    get<T>(url: string, success?: IObservable<T>, failure?: IObservableError, options?: any) : Observable<HttpResponse<T>> {                
        let httpResponse = this.client.get<T>(url, options != null ? { headers: options.headers, observe: 'response' } : {observe: 'response'})

        if (success != null) {
            httpResponse
                .subscribe(x => this.processSuccessResponse(x,success), error => this.processErrorResponse(error, failure));
        }        

        return httpResponse;                   
    }

    post<TRequest, TResponse>(url: string, model: TRequest, 
                                success?: IObservable<TResponse>, 
                                failure?: IObservableError, options?: any) : Observable<HttpResponse<TResponse>> {                
      let httpResponse = this.client.post<TResponse>(url, model, options != null ? 
                                                                  { headers: options.headers, observe: 'response' } 
                                                                  : {observe: 'response'})
      if (success != null) {
          httpResponse
              .subscribe(x => this.processSuccessResponse(x,success), error => this.processErrorResponse(error, failure));
      }        

      return httpResponse;                   
  }    

  private processSuccessResponse<TResponse>(response: HttpResponse<TResponse>, success: IObservable<TResponse>) : void {

    if (success != null) {
      if (response.ok) {
        let subscribe: Subscribe<TResponse> = new Subscribe<TResponse>();
        subscribe.ok = response.ok;
        subscribe.status = response.status;
        subscribe.statusText = response.statusText;
        subscribe.body = response.body;                        
        subscribe.headers = response.headers;
                
        success(subscribe);                            
      }                        
    }      
  }

  private processErrorResponse(error: any, failure: IObservableError) : void {

    if (failure != null) {
      let subscribe: SubscribeError = new SubscribeError();
      subscribe.ok = false;
      subscribe.headers = error.headers;
      subscribe.message = error.message;
      subscribe.status = error.status;
      subscribe.statusText = error.statusText;

      failure(subscribe);
    }      
  }  
}