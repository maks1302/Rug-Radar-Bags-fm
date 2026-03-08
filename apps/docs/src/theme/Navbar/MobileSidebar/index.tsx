import React, { type ReactNode } from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useLockBodyScroll, useNavbarMobileSidebar, useNavbarSecondaryMenu } from "@docusaurus/theme-common/internal";
import NavbarItem, { type Props as NavbarItemConfig } from "@theme/NavbarItem";
import NavbarMobileSidebarHeader from "@theme/Navbar/MobileSidebar/Header";

function useNavbarItems() {
  return useThemeConfig().navbar.items as NavbarItemConfig[];
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="navbar-sidebar__section-title">{children}</p>;
}

export default function NavbarMobileSidebar(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const secondaryMenu = useNavbarSecondaryMenu();
  const items = useNavbarItems();

  useLockBodyScroll(mobileSidebar.shown);

  if (!mobileSidebar.shouldRender) {
    return null;
  }

  return (
    <div className={clsx("navbar-sidebar")}>
      <NavbarMobileSidebarHeader />
      <div className="navbar-sidebar__items">
        <div className="navbar-sidebar__item menu">
          {items.length > 0 && (
            <div className="navbar-sidebar__section">
              <SectionTitle>
                <Translate
                  id="theme.navbar.mobileSidebar.primaryNav"
                  description="Section title for primary navbar links inside the mobile menu">
                  Menu
                </Translate>
              </SectionTitle>
              <ul className={clsx("menu__list", "navbar-sidebar__section-list")}>
                {items.map((item, i) => (
                  <NavbarItem mobile {...item} onClick={() => mobileSidebar.toggle()} key={i} />
                ))}
              </ul>
            </div>
          )}

          {secondaryMenu.content && (
            <div className="navbar-sidebar__section navbar-sidebar__section--docs">
              <SectionTitle>
                <Translate
                  id="theme.navbar.mobileSidebar.docsNav"
                  description="Section title for docs links inside the mobile menu">
                  Docs
                </Translate>
              </SectionTitle>
              {secondaryMenu.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
