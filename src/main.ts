import { enableTooltips } from "./tooltip";
import './masonry'
import './shader'
import './fluent-menu'

enableTooltips()

// tiny SPA router
{
    const navlinks = document.querySelectorAll('nav a')

    document.body.classList.add('js-enabled')

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
            const href = link.href.split('#')[1]
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
}
