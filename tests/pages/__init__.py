from shared import config
from widgets import NavBar, Footer
from pypom import Page as PyPOMPage


def hostpath(url):
    return url.split('?')[0].rstrip('/')


class Page(PyPOMPage):
    URL_TEMPLATE = '/{lang}'
    lang = 'en'

    def __init__(self, browser):
        super(Page, self).__init__(driver=browser, base_url=config.base_url, lang=self.lang)
        self.browser = browser

    def is_current(self):
        return hostpath(self.browser.url) == hostpath(self.seed_url)

    @property
    def navbar(self):
        return NavBar(self.browser.find_by_css('.navbar'))

    @property
    def footer(self):
        return Footer(self.browser.find_by_css('.footer'))
