import * as tf from '@tensorflow/tfjs';

class NetworkParameters
{
    // private static _instance: NetworkParameters;
    private paramNames : Set<string> = new Set(['optimizer']);
    learningRate: number = 0.001;
    batchSize: number = 64;
    optimizer: string = 'sgd';
    epochs: number = 6;
    


    constructor(){}

    public isParam(param){
        return this.paramNames.has(param); 
    }

    public getOptimizer(){
        switch(this.optimizer){
            case 'sgd':
                return tf.train.sgd(this.learningRate)
            
            case 'rmsprop':
                return tf.train.rmsprop(this.learningRate)

            case 'adagrad':
                return tf.train.adagrad(this.learningRate)

            case 'adam':
                return tf.train.adam(this.learningRate)

            default:
                return tf.train.sgd(this.learningRate)
        }
    }

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