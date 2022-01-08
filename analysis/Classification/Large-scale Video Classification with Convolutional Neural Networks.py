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
import scipy

input_fovea = layers.Input(shape=(89, 89, 3), name="fovea_input")
input_high_res = layers.Input(shape=(89, 89, 3), name="high_res_input")

fovea_sequential = layers.Conv2D(96, 11, strides=(3))(input_fovea)
fovea_sequential = layers.LayerNormalization()(fovea_sequential)
fovea_sequential = layers.AveragePooling2D(2)(fovea_sequential)
fovea_sequential = layers.Conv2D(256, 5, strides=(1))(fovea_sequential)
fovea_sequential = layers.LayerNormalization()(fovea_sequential)
fovea_sequential = layers.AveragePooling2D((2, 2))(fovea_sequential)
fovea_sequential = layers.Conv2D(384, 3, strides=(1))(fovea_sequential)
fovea_sequential = layers.Conv2D(384, 3, strides=(1))(fovea_sequential)
fovea_sequential = layers.Conv2D(256, 3, strides=(1))(fovea_sequential)

high_res_sequential = layers.Conv2D(96, (11, 11), strides=(11, 11, 11))(input_high_res)
high_res_sequential = layers.LayerNormalization()(high_res_sequential)
high_res_sequential = layers.AveragePooling2D((2, 2))(high_res_sequential)
high_res_sequential = layers.Conv2D(256, (5, 5), strides=(1))(high_res_sequential)
high_res_sequential = layers.LayerNormalization()(high_res_sequential)
high_res_sequential = layers.AveragePooling2D((2, 2))(high_res_sequential)
high_res_sequential = layers.Conv2D(384, (11, 11), strides=(3, 3))(high_res_sequential)
high_res_sequential = layers.Conv2D(384, (11, 11), strides=(3, 3))(high_res_sequential)
high_res_sequential = layers.Conv2D(256, (11, 11), strides=(3, 3))(high_res_sequential)

x = layers.concatenate([high_res_sequential, fovea_sequential])

output = layers.Dense(4096)(x)
output = layers.Dense(4096)(output)
output = layers.Dense(100, activation='softmax')(output)

model = keras.Model(inputs=[fovea_sequential, high_res_sequential], output=output, name="feed_video")
model.summary()