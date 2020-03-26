import pytest
from pages.main import MainPage
from pages.about import AboutPage
from pages.invest import InvestPage
from pages.raise_ import RaisePage
from pages.not_found import NotFoundPage


@pytest.mark.nondestructive
def test_logo(browser):
    main = MainPage(browser)
    main.open()
    main.navbar.logo.click()
    assert main.is_current()
    assert not NotFoundPage(browser).is_current()


@pytest.mark.nondestructive
def test_main(browser):
    main = MainPage(browser)
    main.open()
    assert main.is_current()
    assert not NotFoundPage(browser).is_current()


@pytest.mark.nondestructive
def test_about(browser):
    about = AboutPage(browser)
    about.open()
    assert about.is_current()
    assert not NotFoundPage(browser).is_current()


@pytest.mark.nondestructive
def test_invest(browser):
    invest = InvestPage(browser)
    invest.open()
    assert invest.is_current()
    assert not NotFoundPage(browser).is_current()


@pytest.mark.nondestructive
def test_raise(browser):
    raise_ = RaisePage(browser)
    raise_.open()
    assert raise_.is_current()
    assert not NotFoundPage(browser).is_current()
