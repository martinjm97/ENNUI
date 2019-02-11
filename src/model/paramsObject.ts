import * as tf from '@tensorflow/tfjs';
import { displayError } from '../ui/error';

export interface HyperparameterData {
    learningRate: number
    batchSize: number
    optimizer_id: string
    epochs: number
    loss_id: string
}

class NetworkParameters
{
    private paramNames : Set<string> = new Set(['optimizer', 'loss']);
    learningRate: number = 0.1;
    batchSize: number = 64;
    optimizer: string = 'sgd';
    epochs: number = 6;
    loss: string = 'categoricalCrossentropy';


    constructor(){}

    public isParam(param){
        return this.paramNames.has(param);
    }

    public getOptimizer(){
        switch(this.optimizer){
            case 'sgd':
                return tf.train.sgd(this.learningRate);

            case 'rmsprop':
                return tf.train.rmsprop(this.learningRate);

            case 'adagrad':
                return tf.train.adagrad(this.learningRate);

            case 'adam':
                return tf.train.adam(this.learningRate);

            default:
                throw new Error('Undefined optimizer!');
        }
    }

    public getPythonLoss() {
        return this.loss.split(/(?=[A-Z])/).join('_').toLowerCase();
    }

    public getPythonOptimizer() {
        switch(this.optimizer) {
            case 'sgd':
                return 'SGD';

            case 'rmsprop':
                return 'RMSprop';

            case 'adagrad':
                return 'Adagrad';

            case 'adam':
                return 'Adam';

            default:
                throw new Error('Undefined optimizer!');
        }
    }

    public getJuliaLoss() {
        switch(this.loss) {
            case 'categoricalCrossentropy':
                return 'crossentropy';

            case 'meanSquaredError':
                return 'mse';

            case 'meanAbsoluteError':
                return '((pred, y) -> mean(abs.(pred .- y)))';

            default:
                throw new Error('Undefined loss!');
        }
    }

    public getJuliaOptimizer() {
        switch(this.optimizer) {
            case 'sgd':
                return 'Descent';

            case 'rmsprop':
                return 'RMSProp';

            case 'adagrad':
                return 'ADAGrad';

            case 'adam':
                return 'ADAM';

            default:
                throw new Error('Undefined optimizer!');
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