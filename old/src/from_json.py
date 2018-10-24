import json
import os

class Node:
    def __init__(self, id, layer_name, children_ids, parent_ids, params):
        self.id = id
        self.layer_name = layer_name
        self.params = params
        self.children_ids = children_ids
        self.parent_ids = parent_ids
        self.precedence = 0

    def label_precedences(self, id_to_node, precedence=0):
        self.precedence = max(precedence, self.precedence)
        for child_id in self.children_ids:
            id_to_node[child_id].label_precedences(id_to_node, precedence + 1)


class InputNode(Node):
    def stringify(self, id_to_node):
        next_line = "\nx" + str(self.id) + " = inputs"
        return "inputs = " + self.layer_name + "(shape=input_shape)" + next_line


class Output(Node):
    def stringify(self, id_to_node):
        parents = [id_to_node[parent_id] for parent_id in self.parent_ids]
        out = ""
        if len(parents) > 1:
            val = ""
            for parent in parents:
                val += "x" + str(parent.id) + ", "
            out = "Concatenate(" + val[:-2] + ")"
        elif len(parents) == 1:
            out = "x" + str(parents[0].id)
        return "predictions = Dense(**" + str(self.params) + ")" + "(" + out + ")"


class LayerNode(Node):

    def stringify(self, id_to_node):
        parents = [id_to_node[parent_id] for parent_id in self.parent_ids]
        out = ""
        if len(parents) > 1:
            val = []
            for parent in parents:
                val.append("Flatten()(x" + str(parent.id) + ")")
            # "x" + str(randint(10**6, 10**8)) +
            out = "Concatenate(" + str(val) + ")"
        elif len(parents) == 1:
            out = "x" + str(parents[0].id)
        if self.layer_name == 'Dense':
            out = 'Flatten()('+out+')'
        return "x" + str(self.id) + " = " + self.layer_name + "(**" + str(self.params) + ")" + "(" + out + ")"


def identify_input_node(graph):
    for o in graph.values():
        if type(o) == InputNode:
            out = o
    return out


def get_graph(filename):
    try:
        with open(filename, 'rb') as f:
            network = json.loads("".join(map(chr, f.read())))
        os.remove(filename)
    except:
        return None
    id_to_node = {}
    for n in network:
        if n["layer_name"] == "Input":
            id_to_node[n["id"]] = InputNode(**n)
        elif n["layer_name"] == "Output":
            id_to_node[n["id"]] = Output(**n)
        else:
            id_to_node[n["id"]] = LayerNode(**n)
    return id_to_node


if __name__ == "__main__":
    get_graph('sample.json')
