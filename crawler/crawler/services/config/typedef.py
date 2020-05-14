class Config:

    def __init__(self, data: dict):
        self._data = data
        self._paths = data.get('paths')
        self._options = data.get('options')

    def get_inputs(self):
        return self._paths.get('inputs')

    def get_output(self):
        return self._paths.get('output')

    def get_exiftool(self):
        return self._paths.get('exiftool')

    def get_trace(self):
        return self._paths.get('trace')

    def get_options(self):
        return self._options.get('options')

