from skeleton import write_script
from from_json import identify_input_node, get_graph
import os
import time
from importlib import reload

try:
	import keras_script
except:
	pass

def mainloop():
	id_to_node = None
	while id_to_node is None:
		id_to_node = get_graph(os.path.expanduser('~/Downloads/model_info.json'))
		print('No file found.')
		time.sleep(1);
	print('File found.')
	inputs = identify_input_node(id_to_node)
	inputs.label_precedences(id_to_node)
	out_strings = {v.precedence: v.stringify(
	    id_to_node) for k, v in id_to_node.items()}
	out_list = [out_strings[k] for k in sorted(out_strings.keys())]
	out_list.append("model = Model(inputs=inputs, outputs=predictions)")
	out = '\n'.join(out_list).replace('\n','\n    ')
	write_script(out)
	try:
		reload(keras_script)
		with open("frontend/python_output/training_output.js", "wb") as f:
			out = "var q = {}"
			f.write(out.encode('utf-8'))
		keras_script.run()
	except:
		pass


if __name__ == '__main__':
	while True:
		mainloop()
		time.sleep(10);