import { enableTooltips } from "./tooltip";
import './masonry'
import './shader'

enableTooltips()

// tiny SPA router
{
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
    }

    loadPage(window.location.href)

    addEventListener("hashchange", e => {
        loadPage(e.newURL)
    });
}
