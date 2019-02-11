import { model } from "./paramsObject";
import { setModelHyperparameters } from "../ui/app";

export function juliaSkeleton(model_code): string {
    setModelHyperparameters();
    return `using Flux, Flux.Data.MNIST, Statistics
using Flux: onehotbatch, onecold, crossentropy, mse, throttle
using Base.Iterators: repeated, partition

# Classify MNIST digits with a convolutional network

imgs = MNIST.images()

labels = onehotbatch(MNIST.labels(), 0:9)
batch_size = ${model.params.batchSize}

# Partition into batches
train = [(cat(float.(imgs[i])..., dims = 4), labels[:,i])
         for i in partition(1:60000, batch_size)]

train = gpu.(train)

# Prepare test set (first 10,000 images)
tX = cat(float.(MNIST.images(:test)[1:10000])..., dims = 4) |> gpu
tY = onehotbatch(MNIST.labels(:test)[1:10000], 0:9) |> gpu

############################# Architecture made by Ennui
function network(input)
${model_code}end
#############################


loss(x, y) = ${model.params.getJuliaLoss()}(network(x), y)

accuracy(x, y) = mean(onecold(network(x)) .== onecold(y))

evalcb = throttle(() -> @show(accuracy(tX, tY)), 10)
opt = ${model.params.getJuliaOptimizer()}(${model.params.learningRate})

for i in 1:${model.params.epochs}
    Flux.train!(loss, params(network), train, opt, cb = evalcb)
end`
}
