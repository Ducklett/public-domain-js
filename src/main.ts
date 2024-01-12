import { enableTooltips } from "./tooltip";
import './masonry'
import './shader'
import './fluent-menu'
import './parallax'

enableTooltips()

// tiny SPA router
{
    const navlinks = document.querySelectorAll('nav a')

    for (let i = 0; i < navlinks.length; i++) {
        const link = navlinks[i] as HTMLAnchorElement;
        const pageName = link.href.split('#')[1];
        const page = document.querySelector(`[data-page="${pageName}"]`) as HTMLElement;

        const bottomNavContainer = document.createElement('nav');
        bottomNavContainer.classList.add('bottom-nav');

        if (i > 0) {
            const prev = navlinks[i - 1] as HTMLAnchorElement

            const prevLink = document.createElement('a');
            prevLink.href = prev.href;
            prevLink.innerHTML = `<small>Previous</small><h3>${i > 0 ? prev.innerText : ''}</h3>`;
            bottomNavContainer.appendChild(prevLink);
        } else {
            const dummy = document.createElement('span');
            bottomNavContainer.appendChild(dummy);
        }

        if (i + 1 < navlinks.length) {
            const next = navlinks[i + 1] as HTMLAnchorElement
            const nextLink = document.createElement('a');
            nextLink.href = next.href;
            nextLink.innerHTML = `<small>Next</small><h3>${i < navlinks.length - 1 ? next.innerText : ''}</h3>`;
            bottomNavContainer.appendChild(nextLink);
        }

        if (!page.classList.contains('container')) {
            const container = document.createElement('div');
            container.classList.add('container');
            container.appendChild(bottomNavContainer);
            page.appendChild(container);
        } else {
            page.appendChild(bottomNavContainer);
        }
    }

    let curpage: HTMLElement | undefined

    function loadPage(url) {
        const pageName = url.split('#')[1] ?? 'intro'
        const page = document.querySelector(`[data-page="${pageName}"]`) as HTMLElement
        if (curpage == page) return
        if (!page) return
        if (curpage) curpage.style.display = ''
        curpage = page
        curpage.style.display = 'block'
        window.scrollTo(0, 0);

        for (let link of navlinks) {
            const href = (link as HTMLAnchorElement).href.split('#')[1]
            if (href == pageName) {
                link.classList.add('selected')
            } else {
                link.classList.remove('selected')
            }
        }
    }

    loadPage(window.location.href)

    addEventListener("hashchange", e => {
        loadPage(e.newURL)
    });

    // stop our placeholder # links from doing anything
    document.addEventListener('click', function (event: any) {
        if (event.target.tagName === 'A' && event.target.getAttribute('href') === '#') {
            event.preventDefault();
        }
    });
}
