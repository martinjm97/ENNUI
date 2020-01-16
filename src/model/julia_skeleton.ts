import { setModelHyperparameters } from "../ui/app";
import { model } from "./params_object";

export function juliaSkeleton(initializationCode: string, modelCode: string): string {
    setModelHyperparameters();
    return `using Flux, Statistics
using Flux: onehotbatch, onecold, crossentropy, mse, throttle, @treelike
using MLDatasets: MNIST, CIFAR10
using Base.Iterators: repeated, partition
using LightGraphs

trainX, trainY = MNIST.traindata()

unsqueeze3(x) = reshape(x, (size(x, 1), size(x, 2), 1, size(x, 3)))

trainX, trainY = unsqueeze3(trainX), onehotbatch(trainY, 0:9)

batch_size = ${model.params.batchSize}

# Partition into batches
train = [(trainX[:,:,:,i], trainY[:,i]) for i in partition(1:50000, batch_size)]

train = gpu.(train)

# Prepare test set (first 10,000 images)
tX, tY = MNIST.testdata()
tX = unsqueeze3(tX) |> gpu
tY = onehotbatch(tY, 0:9) |> gpu

struct Network
    inits::Vector
    nodes::Dict{Int, Any}
    graph::DiGraph
    shapes::Dict{Int, Any}
    data::Dict{Int, Any}
end

Flux.children(net::Network) = values(net.nodes)
Flux.mapchildren(f, net::Network) = map(f, values(net.nodes))

insert!(net, node) = (push!(net.inits, node); add_vertex!(net.graph); length(net.inits))
connect!(net, n1, n2) = add_edge!(net.graph, n1, n2)

net = Network(Vector(), Dict(), SimpleDiGraph(), Dict(), Dict())

############################# Architecture made by Ennui
# Initialize the network
${initializationCode}

# Build the graph
${modelCode}
#############################

# Initialize the network with the appropriate shapes
# This is achived by doing a forward pass with a single batch
function init(net, data)
    worklist = topological_sort_by_dfs(net.graph)
    root = first(worklist)
    for work in worklist
        if work == root
            inputs = data
            node = net.inits[work](size(inputs))
            net.data[work] = node(inputs)
            net.shapes[work] = size(net.data[work])
        else
            input_ids = inneighbors(net.graph, work)
            if (size(input_ids, 1) > 1)
                node = net.inits[work]
                net.data[work] = node(map((x)->net.data[x], input_ids))
                net.shapes[work] = size(net.data[work])
            else
                node = net.inits[work](net.shapes[input_ids[1]])
                net.data[work] = node(net.data[input_ids[1]])
                net.shapes[work] = size(net.data[work])
            end
        end
        net.nodes[work] = node
    end
end

init(net, train[1][1])

function forward(net, data)
    worklist = topological_sort_by_dfs(net.graph)
    root = first(worklist)
    for work in worklist
        if work == root
            net.data[work] = net.nodes[work](data)
        else
            input_ids = inneighbors(net.graph, work)
            if (size(input_ids, 1) > 1)
                net.data[work] = net.nodes[work](map((x)->net.data[x], input_ids))
            else
                net.data[work] = net.nodes[work](net.data[input_ids[1]])
            end
        end
    end
    net.data[size(worklist, 1)]
end

loss(x, y) = ${model.params.getJuliaLoss()}(forward(net, x), y)

accuracy(x, y) = mean(onecold(forward(net, x)) .== onecold(y))

evalcb = throttle(() -> @show(accuracy(tX, tY)), 10)
opt = ${model.params.getJuliaOptimizer()}(${model.params.learningRate})

for i in 1:6
    Flux.train!(loss, params(net), train, opt, cb = evalcb)
end
`;
}
