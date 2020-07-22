# Documentation

The official documentation is published via the GitHub wiki pages.

### How do I insert images?

First, create a resized version of the image you want to include and save both
files in the images directory, e.g ``images/example.png`` and ``images/example_prev.png``.
The recommended size for the preview image is 640x480 or 480x480 pixel.
For Linux, you can simply run

```bash
$ convert -resize 640X480 input.png input_prev.png
```

to resize your input image.
Afterwards, images should be **only** included by the following schema:

```bash
[![Message to show when loading image fails](https://raw.githubusercontent.com/amos-project2/metadata-hub/COMMIT-ID/PATH-TO-PREVIEW-IMAGE)](https://raw.githubusercontent.com/amos-project2/metadata-hub/COMMIT-ID/PATH-TO-FULLSIZE-IMAGE)
```

### How do I generate the .pdf or .html version of the Wiki?

1. Install [github-wikito-converter](https://github.com/yakivmospan/github-wikito-converter)

2. Clone the [wiki](https://github.com/amos-project2/metadata-hub/wiki)

3. Run ``gwtc -f pdf metadata-hub.wiki`` for the .pdf version or omit the ``-f`` flag for the .html version
