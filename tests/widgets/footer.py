from .widget import Widget


class FooterMenu(Widget):
    pass


class Footer(Widget):
    @property
    def logo(self):
        return self.root.find_by_css('.footer__logo-link')

    @property
    def copyright(self):
        return self.root.find_by_css('.footer__copyright')
