from __future__ import print_function
import keras
import json
from keras.datasets import mnist
from keras.models import Model
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten, Input
from keras.layers import Conv2D, MaxPooling2D
from keras import backend as K

class Write_Output_Callback(keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs={}):
        with open("frontend/python_output/training_output.js", "wb") as f:
            out = "var q = " + json.dumps(logs)
            f.write(out.encode('utf-8'))
        return

    def on_train_end(self, epoch, logs={}):
        with open("frontend/python_output/training_output.js", "wb") as f:
            logs['status'] = 'Trained'
            out = "var q = " + json.dumps(logs)
            f.write(out.encode('utf-8'))
        return

def run():
    batch_size = 128
    num_classes = 10
    epochs = 12

    # input image dimensions
    img_rows, img_cols = 28, 28

    # the data, split between train and test sets
    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    if K.image_data_format() == 'channels_first':
        x_train = x_train.reshape(x_train.shape[0], 1, img_rows, img_cols)
        x_test = x_test.reshape(x_test.shape[0], 1, img_rows, img_cols)
        input_shape = (1, img_rows, img_cols)
    else:
        x_train = x_train.reshape(x_train.shape[0], img_rows, img_cols, 1)
        x_test = x_test.reshape(x_test.shape[0], img_rows, img_cols, 1)
        input_shape = (img_rows, img_cols, 1)

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

    inputs = Input(shape=input_shape)
    xIN = inputs
    x10382015100148934 = Dense(**{'units': 64})(Flatten()(xIN))
    x48432127238966305 = Dense(**{'units': 64})(Flatten()(x10382015100148934))
    predictions = Dense(**{'units': 10, 'activation': 'softmax'})(x48432127238966305)
    model = Model(inputs=inputs, outputs=predictions)

    model.compile(loss=keras.losses.categorical_crossentropy,
                optimizer=keras.optimizers.Adadelta(),
                metrics=['accuracy'])
    print('compiled.')
    epochs = 30
    batch_size = 256
    model.fit(x_train, y_train,
            batch_size=batch_size,
            epochs=epochs,
            callbacks=[Write_Output_Callback()],
            verbose=1,
            validation_data=(x_test, y_test))
    score = model.evaluate(x_test, y_test, verbose=0)
    print('Test loss:', score[0])
    print('Test accuracy:', score[1])

    model.save("demo.h5")
