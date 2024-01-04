export class FluentMenu extends HTMLElement {
    constructor() {
        super()

        const cur = this.querySelector('[fluent-menu-cursor]') as HTMLElement
        this.addEventListener('mouseover', e => {
            if (e.target) {
                const m = (e.target as HTMLElement).closest('[fluent-menu-item]') as HTMLElement
                if (!m) return
                cur.style.setProperty('--left', m.offsetLeft.toString())
                cur.style.setProperty('--top', m.offsetTop.toString())
                cur.style.setProperty('--width', m.offsetWidth.toString())
                cur.style.setProperty('--height', m.offsetHeight.toString())
            }
        })
    }
}
customElements.define('ks-fluentmenu', FluentMenu)