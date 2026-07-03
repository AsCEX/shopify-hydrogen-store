import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';

interface FooterProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  cart,
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer">
            {header.shop.primaryDomain?.url && (
              <FooterMenu
                cart={cart}
                menu={footer?.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  cart,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  cart: FooterProps['cart'];
  menu: FooterQuery['menu'] | null | undefined;
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      type: 'HOME',
      url: '/',
    },
    ...FALLBACK_FOOTER_MENU.items,
  ].slice(0, 5);

  return (
    <nav className="footer-menu" role="navigation" aria-label="Footer menu">
      {menuItems.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        const isCartItem =
          item.title.toLowerCase().includes('cart') || url === '/cart';
        const icon = getFooterIcon(item.title, item.type);
        const content = (
          <>
            <span className="footer-menu-icon" aria-hidden="true">
              {icon}
              {isCartItem && <CartMenuBadge cart={cart} />}
            </span>
            <span className="footer-menu-label">{item.title}</span>
          </>
        );

        return isExternal ? (
          <a
            className="footer-menu-item"
            href={url}
            key={item.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            {content}
          </a>
        ) : (
          <NavLink
            className={({isActive}) =>
              `footer-menu-item${isActive ? ' active' : ''}`
            }
            end
            key={item.id}
            prefetch="intent"
            to={url}
          >
            {content}
          </NavLink>
        );
      })}
    </nav>
  );
}

function CartMenuBadge({cart}: {cart: FooterProps['cart']}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={cart}>
        {(cart) => {
          const count = cart?.totalQuantity ?? 0;

          if (count === 0) {
            return null;
          }

          return (
            <span className="footer-menu-badge" aria-label={`${count} items`}>
              {count > 99 ? '99+' : count}
            </span>
          );
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Collection',
      type: 'SHOP_POLICY',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Sales',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Cart',
      type: 'SHOP_POLICY',
      url: '/cart',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Profile',
      type: 'SHOP_POLICY',
      url: '/account/profile',
      items: [],
    },
  ],
};

function getFooterIcon(title: string, type?: string) {
  const normalizedTitle = title.toLowerCase();
  const normalizedType = type?.toLowerCase() ?? '';

  if (normalizedTitle.includes('home') || normalizedType === 'home') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M3 10.7 12 3l9 7.7v9.8a.5.5 0 0 1-.5.5H15v-6H9v6H3.5a.5.5 0 0 1-.5-.5v-9.8Z" />
      </svg>
    );
  }

  if (normalizedTitle.includes('collection')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
      </svg>
    );
  }

  if (normalizedTitle.includes('sales')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path
          fillRule="evenodd"
          d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalizedTitle.includes('cart')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
    );
  }

  if (normalizedTitle.includes('profile')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 13h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
    </svg>
  );
}
