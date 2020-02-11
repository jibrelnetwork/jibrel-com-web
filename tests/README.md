# Automatic Functional Testing

## Setup development environment

1. Install python 3 (or use already installed) – check it exists with `python3 -V`
2. Create virtual environment:
    1. Open terminal
    2. Go to this directory
    3. Run `python3 -m venv ./venv`
3. Activate virtual environment with `source venv/bin/activate`
4. Install `poetry` dependency manager with `pip install poetry`
5. Install dependencies with `poetry install`
6. Install your webdriver of choice:
    1. Chrome: `brew cask install chromedriver`
    2. Firefox: `brew install geckodriver`
7. Add your preferred webdriver as argument for `pytest` run:
    1. Chrome: `pytest --browser chrome`
    2. Firefox: `pytest --browser firefox`


## Recommended directory structure

We define our test environment using these core concepts:
- Browser – is a WebDriver instance remote or local. We use [splinter](https://splinter.readthedocs.io/en/latest/index.html) as a Browser abstraction.
- Page – is an instance representing the page we are interacting with. For details of this concept please see [Martin Fowler on PageObject](https://martinfowler.com/bliki/PageObject.html). As a core Page Object abstraction we use [PyPOM](https://pypom.readthedocs.io/en/latest/index.html).
- Widget – is an instance of repeated interface block. It can be as little as single field and as most of the page – the core principle is for it to be reusable. Because we are building app, we will reuse interface blocks a lot, so it will be very useful.

Pages are stored under `pages` directory, inheriting from core `pages.Page`. Every page takes `browser` as a constructor argument.

Widgets are stored under `widgets` directory, inheriting from core `widgets.widget.Widget`. Because Widget is repeated block, it takes bounding element as a constructor argument.

Actual test cases are stored under `specs` directory. Every test automagicaly (via [pytest fixtures](https://docs.pytest.org/en/latest/fixture.html)) receives current session browser instance, which can be safely passed "as is" to underlying pages.
