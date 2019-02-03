import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IObservableBase {
    
}

export interface IObservableErrorBase {
    
}

/*
Success callback - returns the model from the body of the API response
*/
export interface IObservable<T> extends IObservableBase {
    (subscribe: T) : void;    
}

/*
Success callback - returns the http response and the model from the body of the API response
*/
export interface IObservableHttpResponse<T> extends IObservableBase {
  (subscribe: ISubscribe<T>) : void;    
}

/* 
Failure callback - returns the API thrown custom exception
*/
export interface IObservableError<TError> extends IObservableErrorBase {
    (error: TError) : void;
}

/* 
Failure callback - returns the http error response through interface ISubscribeError
*/
export interface IObservableHttpError extends IObservableErrorBase {
  (error: ISubscribeError) : void;
}

/* 
Failure callback - returns the http error response and the API throw custom exception through interface ISubscribeCustomError<TError>
*/
export interface IObservableHttpCustomError<TError> extends IObservableErrorBase {
  (error: ISubscribeCustomError<TError>) : void;
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

export interface ISubscribeCustomError<TError> extends ISubscribeBase {
  error: TError;
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

export class SubscribeCustomError<TError> implements ISubscribeCustomError<TError> {
  ok: boolean;
  error: TError;
  headers: HttpHeaders;
  message: string;
  status: number;
  statusText: string;
}

export enum ErrorType {
  IObservableError,
  IObservableHttpError,
  IObservableHttpCustomError
}

export interface IHttpClientExtended {
    get<T>(url: string, success?: IObservable<T>, failureType?: ErrorType, failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<T>>;

    getUsingHttpResponse<T>(url: string, 
                              success?: IObservableHttpResponse<T>, 
                              failureType?: ErrorType, 
                              failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<T>>;

    post<TRequest, TResponse>(url: string, model: TRequest, 
                                success?: IObservable<TResponse>, 
                                failureType?: ErrorType,
                                failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<TResponse>>;

    postUsingHttpResponse<TRequest, TResponse>(url: string, model: TRequest, 
                                                  success?: IObservableHttpResponse<TResponse>, 
                                                  failureType?: ErrorType,
                                                  failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<TResponse>>;                              
}

@Injectable({
  providedIn: 'root'
})
export class HttpClientExt implements IHttpClientExtended {

  constructor(private client: HttpClient)
  {
  }
  
  get<T>(url: string, success?: IObservable<T>, failureType?: ErrorType, failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<T>> {                
    let httpResponse = this.client.get<T>(url, options != null ? { headers: options.headers, observe: 'response' } : {observe: 'response'});

    if (success != null) {
        httpResponse
            .subscribe(x => this.processSuccessResponse(x,success), error => this.processErrorResponse(error, failure, failureType));
    }        

    return httpResponse;                   
  }

  getUsingHttpResponse<T>(url: string, 
                            success?: IObservableHttpResponse<T>, 
                            failureType?: ErrorType,
                            failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<T>> {                
    let httpResponse = this.client.get<T>(url, options != null ? { headers: options.headers, observe: 'response' } : {observe: 'response'});

    if (success != null) {
        httpResponse
            .subscribe(x => this.processSuccessHttpResponse(x,success), error => this.processErrorResponse(error, failure, failureType));
    }        

    return httpResponse;                   
  }

  post<TRequest, TResponse>(url: string, model: TRequest, 
                              success?: IObservable<TResponse>,
                              failureType?: ErrorType, 
                              failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<TResponse>> {                
    let httpResponse = this.client.post<TResponse>(url, model, options != null ? 
                                                                { headers: options.headers, observe: 'response' } 
                                                                : {observe: 'response'});
    if (success != null) {
        httpResponse
            .subscribe(x => this.processSuccessResponse(x,success), error => this.processErrorResponse(error, failure, failureType));
    }        

    return httpResponse;                   
  }

  postUsingHttpResponse<TRequest, TResponse>(url: string, model: TRequest, 
                                                      success?: IObservableHttpResponse<TResponse>,
                                                      failureType?: ErrorType, 
                                                      failure?: IObservableErrorBase, options?: any) : Observable<HttpResponse<TResponse>> {                
    let httpResponse = this.client.post<TResponse>(url, model, options != null ? 
                                                                { headers: options.headers, observe: 'response' } 
                                                                : {observe: 'response'});
    if (success != null) {
        httpResponse
            .subscribe(x => this.processSuccessHttpResponse(x,success), error => this.processErrorResponse(error, failure, failureType));
    }        

    return httpResponse;                   
  }

  private processSuccessResponse<TResponse>(response: HttpResponse<TResponse>, success: IObservable<TResponse>) : void {

    if (success != null) {
      if (response.ok) {
        success(response!.body);
      }                        
    }      
  }

  private processSuccessHttpResponse<TResponse>(response: HttpResponse<TResponse>, success: IObservableHttpResponse<TResponse>) : void {

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

  private processErrorResponse<TError>(error: any, failure: IObservableErrorBase, errorType: ErrorType) : void {

    switch(errorType)
    {
      case ErrorType.IObservableError:
        let observableError = <IObservableError<TError>> failure;
        observableError(error!.error);        
        break;
      case ErrorType.IObservableHttpError:
        let observableHttpError = <IObservableHttpError> failure;
        let subscribe1: SubscribeError = new SubscribeError();
        subscribe1.ok = false;
        subscribe1.headers = error.headers;
        subscribe1.message = error.message;
        subscribe1.status = error.status;
        subscribe1.statusText = error.statusText;

        observableHttpError(subscribe1);
        break;
      case ErrorType.IObservableHttpCustomError:
        let observableHttpCustomError = <IObservableHttpCustomError<TError>> failure;
        let subscribe: SubscribeCustomError<TError> = new SubscribeCustomError();
        subscribe.ok = false;
        if (error.error) {
          subscribe.error = error.error;
        }        
        subscribe.headers = error.headers;
        subscribe.message = error.message;
        subscribe.status = error.status;
        subscribe.statusText = error.statusText;

        observableHttpCustomError(subscribe);
        break;
      default:        
        break;
    }
  }  
}