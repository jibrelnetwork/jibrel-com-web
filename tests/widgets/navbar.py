from collections import namedtuple
from .widget import Widget


class NavBarPrimaryMenu(Widget):
    @property
    def links(self):
        PrimaryMenuLinks = namedtuple('PrimaryMenuLinks', ['invest', 'raise', 'about'])
        links = self.root.find_by_css('.navbar__menu-link')
        return PrimaryMenuLinks(
            links[0],
            links[1],
            links[2],
        )


class NavBarUserMenu(Widget):
    @property
    def is_logged_in(self):
        # FIXME: Should be better solution
        return self.root.is_element_present_by_text('Log out')

    @property
    def links(self):
        UserMenuLinks = namedtuple('UserMenuLinks', ['login', 'signup'])
        links = self.root.find_by_css('.navbar__menu-link')
        return UserMenuLinks(
            links[0],
            links[1],
        )


class NavBar(Widget):
    @property
    def logo(self):
        return self.root.find_by_css('.navbar__logo-link')

    @property
    def primary(self):
        return NavBarPrimaryMenu(self.root.find_by_css('.navbar__menu-list')[0])

    @property
    def user(self):
        return NavBarPrimaryMenu(self.root.find_by_css('.navbar__menu-list')[1])
