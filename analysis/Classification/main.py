import tensorflow as tf
import tensorflow_datasets as tfds
import numpy as np
import IPython.display as display
from PIL import Image
import matplotlib.pyplot as plt
from tensorflow.keras import models, layers, datasets, preprocessing
import tensorflow.keras as keras

import os
import json
import glob
import pathlib
import cv2

folder = "F:/UCF101/data/"
train = "train/"
test = "test/"


def load_video(path, split, max_frames=0):
    arr = []
    os.chdir(folder+split)
    path = path.split("/")[-1]
    for file in glob.glob(path+"*"):
        image = Image.open(file, "r")
        width, height = image.size
        pixel_values = list(image.getdata())
        if image.mode == "RGB":
            channels = 3
        elif image.mode == "L":
            channels = 1
        pixel_values = np.array(pixel_values).reshape(
            (width, height, channels))
        arr.append(pixel_values)
    return tf.convert_to_tensor(arr)


class DataGenerator(keras.utils.Sequence):
    def __init__(self, list_IDs, labels, mode, batch_size=32, dim=(32, 32, 32), n_channels=1,
                 n_classes=10, shuffle=True):
        'Initialization'
        self.dim = dim
        self.batch_size = batch_size
        self.labels = labels
        self.list_IDs = list_IDs
        self.n_channels = n_channels
        self.n_classes = n_classes
        self.shuffle = shuffle
        self.on_epoch_end()
        self.mode = mode

    def __len__(self):
        return int(np.floor(len(self.list_IDs) / self.batch_size))

    def __getitem__(self, index):
        # Generate indexes of the batch
        indexes = self.indexes[index*self.batch_size:(index+1)*self.batch_size]

        # Find list of IDs
        list_IDs_temp = [self.list_IDs[k] for k in indexes]

        # Generate data
        X, y = self.__data_generation(list_IDs_temp)

        return X, y

    def on_epoch_end(self):
        self.indexes = np.arange(len(self.list_IDs))
        if self.shuffle == True:
            np.random.shuffle(self.indexes)

    def __data_generation(self, list_IDs_temp):
        # X : (n_samples, *dim, n_channels)
        # Initialization
        X = []
        y = []

        # Generate data
        for ID in range(len(list_IDs_temp)):
            # Store sample
            X.append(load_video(list_IDs_temp[ID], self.mode))

            # Store class
            y.append(self.labels[ID])
        X = tf.keras.preprocessing.sequence.pad_sequences(X)
        return X, np.array(y)

#classes = list(folder.glob('*/*.json'))


items = list(pathlib.Path(folder).glob("*/*.*"))

BATCH_SIZE = 4
STEPS_PER_EPOCH = 10  # np.ceil(len(items)/BATCH_SIZE)
NUMBER_EPOCHS = 10
#STEPS_PER_EPOCH = np.ceil(len(classes)/BATCH_SIZE)

f = open("F:\\UCF101\\ucfTrainTestlist\\trainlist01.txt")
label_desc = f.readlines()

inputs = np.array([label_desc[e].strip().split(" ")[0] for e in range(
    len(label_desc)) if ((e*1.0)/len(label_desc)) < .75])
labels = np.array([float(label_desc[e].strip().split(" ")[1])
                  for e in range(len(label_desc)) if ((e*1.0)/len(label_desc)) < .75])

valInputs = np.array([label_desc[e].strip().split(" ")[0] for e in range(
    len(label_desc)) if ((e*1.0)/len(label_desc)) >= .75])
valLabels = np.array([float(label_desc[e].strip().split(" ")[1])
                     for e in range(len(label_desc)) if ((e*1.0)/len(label_desc)) >= .75])


def video_gen():
    for elem in range(len(inputs)):
        print(labels[elem])
        print(load_video(inputs[elem]))
        yield (labels[elem], load_video(inputs[elem]))


dataset = tf.data.Dataset.from_generator(
    video_gen,
    (tf.float32, tf.float32),
    (tf.TensorShape([]), tf.TensorShape([None]))
)

gen = DataGenerator(inputs, labels, train, batch_size=BATCH_SIZE)

testGen = DataGenerator(valInputs, valLabels, train, batch_size=BATCH_SIZE)

model = models.Sequential()

# variable length, set height, set width, 3 channels
model.add(layers.Input(shape=(None, 320, 240, 3)))
model.add(layers.Conv3D(64, (3, 3, 3), activation='relu'))
model.add(layers.MaxPooling3D((2, 2, 2)))
#model.add(layers.Conv3D(64, (3, 3, 3), activation='relu'))
#model.add(layers.MaxPooling3D((2, 2, 2)))
#model.add(layers.Conv3D(16, (3, 3, 3), activation='relu'))
model.add(layers.Flatten())

model.compile(loss="binary_crossentropy", optimizer="adadelta")

model.summary()

model.fit(gen,
          validation_data=testGen,
          epochs=NUMBER_EPOCHS,
          verbose=1,
          steps_per_epoch=STEPS_PER_EPOCH
          )

model.save(folder+'first_try')
