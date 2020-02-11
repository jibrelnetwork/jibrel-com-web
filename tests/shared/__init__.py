browsers = {
    'firefox': {
        'driver_name': 'firefox'
    },
    'chrome': {
        'driver_name': 'chrome'
    },
    'browserstack': {
        'driver_name': 'remote'
    },
}


class Config:
    def __init__(self):
        self._browser = None
        self._base_url = None

    @property
    def browser(self):
        return self._browser

    @browser.setter
    def browser(self, browser):
        if (browser not in browsers):
            raise ValueError(f'No browser "{browser}" defined')
        self._browser = browser

    @property
    def base_url(self):
        return self._base_url

    @base_url.setter
    def base_url(self, base_url):
        self._base_url = base_url.rstrip('/')

    @property
    def splinter_config(self):
        return browsers[self._browser]


config = Config()
