from pages import Page


class NotFoundPage(Page):
    URL_TEMPLATE = '/404'

    def is_current(self):
        return self.browser.is_element_present_by_css('.error_hero') and \
            self.browser.find_by_css('.error_hero').get_attribute('alt') == '404 Not Found'
