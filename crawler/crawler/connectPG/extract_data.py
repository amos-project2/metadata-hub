"""Extract metadata from JSON data."""

import json
import datetime

from .refine_data import refineData

class extractData:

    #: Predefined datetime format
    _TIMESTAMP_FORMAT = '%Y-%m-%d %H:%M:%S'

    #: Table names and their attributes in database
    _TABLES = { "tree_walk"            : ["name", "notes", "root_path", "created_time", "status", "crawl_config", "save_in_gerneric_table"], \
                "file_generic"         : ["tree_walk_id", "sub_dir_path", "name", "file_typ", "size", "file_modify_date", "file_access_date", "file_create_date", "metadata"], \
                "file_generic_data_eav": ["tree_walk_id", "file_generic_id", "attribute", "value", "unit"]}

    # #: Attribute names from database (Left), from exiftool (Right)
    # _ATT_EXIFTOOL = {"name"                  :   "FileName",        \
    #                  "notes"                 :   "Directory",       \
    #                  "root_path"             :   "SourceFile",      \
    #                  "size"                  :   "FileSize",        \
    #                  "file_typ"              :   "FileType",        \
    #                  "file_modify_date"      :   "FileModifyDate",  \
    #                  "file_access_date"      :   "FileAccessDate",  \
    #                  "file_create_date"      :   "FileCreateDate",  \
    #                  "sub_dir_path"          :   "SourceFile",      \
    #                  "tree_walk_id"          :   "",                \
    #                  "file_generic_id"       :   "",                \
    #                  "save_in_gerneric_table":   "",                \
    #                  "metadata"              :   "",                \
    #                  "crawl_config"          :   "",                \
    #                  "created_time"          :   "",                \
    #                  "status"                :   "",                \
    #                  "attribute"             :   "",                \
    #                  "value"                 :   "",                \
    #                  "unit"                  :   ""}
    #: Attribute names from database (Left), from exiftool (Right)
    _ATT_EXIFTOOL = {"name"                  :   "FileName",        \
                     "notes"                 :   "Directory",       \
                     "root_path"             :   "Directory",      \
                     "size"                  :   "FileSize",        \
                     "file_typ"              :   "FileType",        \
                     "file_modify_date"      :   "FileModifyDate",  \
                     "file_access_date"      :   "FileAccessDate",  \
                     "file_create_date"      :   "FileCreateDate",  \
                     "sub_dir_path"          :   "SourceFile",      \
                     "tree_walk_id"          :   "",                \
                     "file_generic_id"       :   "",                \
                     "save_in_gerneric_table":   "",                \
                     "metadata"              :   "",                \
                     "crawl_config"          :   "",                \
                     "created_time"          :   "",                \
                     "status"                :   "",                \
                     "attribute"             :   "",                \
                     "value"                 :   "",                \
                     "unit"                  :   ""}
    def __init__(self, input: dict) -> None:
        """Initialize the object.

        Args:
            input (dict): dictionary of all json data from Exiftool

        """
        self._input = input



    def extract_metadata(self) -> list:
        """extract the metadata from json data from Exiftool.

        Returns:
            list: list of query, each element is an INSERT Postgres query to 1 table,
            the metadata is only from 1 file e.g. jpeg, mp4, etc.

        """
        query    = []
        tables   = extractData._TABLES.keys()

        for table in tables:
            metadata  = []
            table_att = extractData._TABLES.get(table)
            created_time = datetime.datetime.now().strftime(extractData._TIMESTAMP_FORMAT)
            insertin = "INSERT INTO {a} ({b}) ".format(a = table, \
                                                       b = ", ".join(table_att))


            attributesTmp = []
            valuesTmp = []

            for att_name in table_att:
                att_exiftool = extractData._ATT_EXIFTOOL[att_name]

                # To insert data with specific attribute names that cannot extract
                # directly without refining or modifying
                if att_name == "attribute":
                    attribute = [*self._input]
                    att_input = "'{}'".format(" ,".join(attribute))
                    attributesTmp = att_input.split(' ,')
                    attributesTmp[0] = attributesTmp[0][1:]
                    attributesTmp[len(attributesTmp)-1] = attributesTmp[len(attributesTmp)-1][:-1]

                elif att_name == "value":
                    value       = [*self._input.values()]
                    value_input = refineData(self._input).refine_values(value)
                    valuesTmp = value_input.split(', ')
                    valuesTmp[0] = valuesTmp[0][1:]
                    valuesTmp[len(valuesTmp)-1] = valuesTmp[len(valuesTmp)-1][:-1]

                    for i in range(0, len(attributesTmp)):
                        test = metadata.copy()
                        test.append(f"'{attributesTmp[i]}'")
                        test.append(f"'{valuesTmp[i]}'")
                        test.append('NULL')
                        values = " VALUES({a})".format(a=" ,".join(test))
                        query.append(insertin + values)
                    continue

                elif att_name == "metadata":
                    metadata_input = "'{}'".format(json.dumps(self._input))
                    metadata.append(metadata_input)

                elif att_name == "created_time":
                    metadata.append("'{}'".format(created_time))

                elif att_name == "size":
                    size_output = refineData(self._input).refine_size()
                    text_input = "{}".format(int(size_output))
                    metadata.append(text_input)

                elif att_name in ["file_modify_date","file_access_date", "file_create_date"]:
                    date_output = refineData(self._input).refine_date(att_exiftool)
                    text_input = "'{}'".format(date_output)
                    metadata.append(text_input)

                elif att_name in ["tree_walk_id", "file_generic_id"]:
                    metadata.append('1')

                elif att_name == "sub_dir_path":
                    text_input = "'{}'".format(self._input.get(att_exiftool, ""))
                    text_input = text_input[len(self._input.get("Directory", "")) + 1 : - (len(self._input.get("FileName")))-1]
                    if text_input == '/':
                        text_input = '/.'
                    metadata.append("'{}'".format(text_input))

                elif att_name == "notes":
                    metadata.append("'---'")

                elif not att_exiftool:
                    metadata.append("NULL")

                else:
                    text_input = "'{}'".format(self._input.get(att_exiftool, ""))
                    metadata.append(text_input)

            values = " VALUES({a})".format(a = " ,".join(metadata))
            query.append(insertin + values)

        return query


#if __name__=='__main__':
#
#    with open(f'{pathProtocol}\protocol1058610.json', 'r') as f:
#        d = json.load(f)
#
#    dataa = extractData(d[0]).extract_metadata()
