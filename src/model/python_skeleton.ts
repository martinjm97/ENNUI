import { setModelHyperparameters } from "../ui/app";
import { dataset } from "./data";
import { model } from "./paramsObject";

export function pythonSkeleton(modelCode: string): string {
    setModelHyperparameters();
    return `from __future__ import print_function
import keras
from keras.datasets import ${dataset.pythonName}
from keras.models import Model
from keras.layers import Dense, Dropout, Flatten, Input, Concatenate, BatchNormalization, Add
from keras.layers import Conv2D, MaxPooling2D, ReLU
from keras import backend as K

batch_size = ${model.params.batchSize}
num_classes = ${dataset.NUM_CLASSES}
epochs = ${model.params.epochs}

# input image dimensions
img_rows, img_cols, channels = ${dataset.IMAGE_HEIGHT}, ${dataset.IMAGE_WIDTH}, ${dataset.IMAGE_CHANNELS}

# the data, split between train and test sets
(x_train, y_train), (x_test, y_test) = ${dataset.pythonName}.load_data()

if K.image_data_format() == 'channels_first':
    x_train = x_train.reshape(x_train.shape[0], channels, img_rows, img_cols)
    x_test = x_test.reshape(x_test.shape[0], channels, img_rows, img_cols)
    input_shape = (channels, img_rows, img_cols)
else:
    x_train = x_train.reshape(x_train.shape[0], img_rows, img_cols, channels)
    x_test = x_test.reshape(x_test.shape[0], img_rows, img_cols, channels)
    input_shape = (img_rows, img_cols, channels)

x_train = x_train.astype('float32')
x_test = x_test.astype('float32')
x_train /= 255
x_test /= 255
print('x_train shape:', x_train.shape)
print(x_train.shape[0], 'train samples')
print(x_test.shape[0], 'test samples')

# convert class vectors to binary class matrices
y_train = keras.utils.to_categorical(y_train, num_classes)
y_test = keras.utils.to_categorical(y_test, num_classes)

############################# Architecture made by Ennui
${modelCode}
#############################

model.compile(loss=keras.losses.${model.params.getPythonLoss()},
              optimizer=keras.optimizers.${model.params.getPythonOptimizer()}(lr=${model.params.learningRate}),
              metrics=['accuracy'])

model.fit(x_train, y_train,
          batch_size=batch_size,
          epochs=epochs,
          verbose=1,
          validation_data=(x_test, y_test))
score = model.evaluate(x_test, y_test, verbose=0)
print('Test loss:', score[0])
print('Test accuracy:', score[1])
`;
}
