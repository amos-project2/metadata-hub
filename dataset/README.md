# Dataset

The dataset is used for both

* developing & debugging
* demo

purposes. Due to its size, it is not included in the official repository.
If you want to have access to the dataset, please send us an e-mail at
[amos-metadatahub@protonmail.com](mailto:amos-metadatahub@protonmail.com?subject=[GitHub]%20Dataset).
The dataset is available in two ways:

* a single folder containing all files
* a directory tree with the files divided into multiple directories

The reason for this is how the TreeWalk itself is implemented in detail.

## Structure

The dataset contains the following file types:

* _mp3_
* _wma_
* _mp4_
* _exe_
* _vi_
* _txt_
* _m_
* _pdf_
* _md_
* _png_
* _gif_
* _jpg_
* _accdb_
* _doc_
* _zip_
* _flv_
* _xlsx_
* _flv_
* _tif_
* _html_
* _ini_
* _docx_

## Generation of the directory tree

The test directory with the tree structure was created with the
``random_tree.py`` tool.

```bash
$ python3.8 random_tree.py -h
```

The output is:

```
usage: random_tree.py [-h] input output name depth big_dir_prob big_dir_size dirs max_files

positional arguments:
  input         Input directory with the files.
  output        Output directory
  name          Name of the final directory
  depth         Maximum depth of directory tree
  big_dir_prob  Probability of creating big directories
  big_dir_size  number of files in big directories
  dirs          Maximum number of directories in one directory
  max_files     Maximum number of files in one directory

optional arguments:
  -h, --help    show this help message and exit
```

The test directory was created with the following command:

```bash
$ python3.8 random_tree.py ~/Desktop/reference_flat/ ~/Desktop/ reference_tree 6 0.2 25 5 10
```

The output was:

```
* Created 337 directories in total.
* Created 18 big directories with each containing 25 files.
* Copied 1104 files in total.
```
