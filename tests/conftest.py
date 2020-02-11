import pytest
from shared import config as global_config
from splinter import Browser


def pytest_addoption(parser):
    parser.addoption("--browser", action="store", default="firefox")


def pytest_configure(config):
    global_config.browser = config.getoption('--browser')
    global_config.base_url = config.getoption('base_url') or config.getini('base_url')


@pytest.fixture(scope='session')
def browser():
    browser_instance = Browser(**global_config.splinter_config)
    yield browser_instance
    browser_instance.quit()
