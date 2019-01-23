import * as tf from '@tensorflow/tfjs';

class NetworkParameters
{
    // private static _instance: NetworkParameters;
    private paramNames : Set<string> = new Set(['optimizer']);
    learningRate: number;
    batchSize: number;
    optimizer: string = 'sgd';
    epochs: number;
    subset: number;


    constructor(){}

    public isParam(param){
        return this.paramNames.has(param); 
    }

    // public static get Instance()
    // {
    //     return this._instance || (this._instance = new this());
    // }
}

class Model
{
    private static _instance: Model;
    params : NetworkParameters = new NetworkParameters();
    architecture = null;

    private constructor(){}

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}

export const model = Model.Instance;