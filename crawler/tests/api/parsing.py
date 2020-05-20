"""Unittest: crawler.api.parsing"""


import unittest


import crawler.api.parsing as parsing


class TestClass(unittest.TestCase):

    def test_dummy(self):
        """Dummy test"""
        self.assertIsNotNone(parsing.REQUIRED_PROPERTIES)
