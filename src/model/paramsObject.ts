class NetworkParameters
{
    private static _instance: NetworkParameters;
    private paramNames : Set<string> = new Set(['optimizer']);
    learningRate: number;
    batchSize: number;
    optimizer: string = 'sgd';
    epochs: number;
    subset: number;


    private constructor(){}

    public isParam(param){
        return this.paramNames.has(param); 
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}

export const networkParameters = NetworkParameters.Instance;