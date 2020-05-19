"""Refine metadata from JSON data."""



class refineData:
    """Class representation of a data refining."""

    def __init__(self, input: dict) -> None:
        """Initialize the object.

        Attributes:
            intput (dict): dictionary of all extracted data from Exiftool

        """
        self._input = input



    def refine_size(self) -> int:
        """Refine the attribute 'FileSize', e.g: 5kB, 10MB.

        Returns:
            Int: a value represents for File Size

        """
        byte_unit = self._input["FileSize"]

        if byte_unit[-2::] == "kB":
            return float(byte_unit[0:-3]) * 1000
        elif byte_unit[-2::] == "MB":
            return float(byte_unit[0:-3]) * 1000000
        elif byte_unit[-2::] == "GB":
            return float(byte_unit[0:-3]) * 1000000000



    def refine_date(self, attr: str) -> str:
        """Convert format of extracted date from Exiftool into Postgre format.

        Args:
            string (str): attribute name (a date attribute)

        Returns:
            String: extracted Exiftool date in Postgre format

        """

        date_output = self._input.get(attr, "")
        if date_output == "":
            date_output = '2020-05-18 16:46:17+02:00'
        return date_output[:10].replace(':','-') + date_output[10::]



    def refine_values(self, values: list) -> str:
        """Convert all extracted values from Exiftool, which are stored in a list,
        into a string to store in attribute "value"-bjson format in Postgre

        Args:
            values (list): list of all values/items (e.g: {keys:values})

        Returns:
            String: a string of all values, which are refined with ', ", [, ]

        """
        value_output = []

        for x in values:
            if type(x) is list:
                value_output.append(str(" ".join(x)))
            else:
                value_output.append(str(x))

        return "'{}'".format(", ".join(value_output))

