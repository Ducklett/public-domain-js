export class FluentMenu extends HTMLElement {

    cursorElement: HTMLElement
    cursorVisible = true

    constructor() {
        super()

        this.style.display = 'inline-block'

        this.cursorElement = this.querySelector('[fluent-menu-cursor]') as HTMLElement

        if (!this.cursorElement) {
            throw new Error('failed to initialize FluentMenu, no [fluent-menu-cursor] was found inside')
        }

        this.hideCursor()

        this.addEventListener('focusin', e => {
            if (e.target) {
                const m = (e.target as HTMLElement).closest('[fluent-menu-item]') as HTMLElement
                if (!m) {
                    this.hideCursor()
                    return
                }

                this.showCursor()
                this.moveCursor(m)
            }
        })

        this.addEventListener('focusout', e => {
            this.hideCursor()
        })

        this.addEventListener('mouseover', e => {
            if (e.target) {
                const m = (e.target as HTMLElement).closest('[fluent-menu-item]') as HTMLElement
                if (!m) {
                    this.hideCursor()
                    return
                }

                this.showCursor()
                this.moveCursor(m)
            }
        })

        this.addEventListener('mouseleave', e => {
            this.hideCursor()
        })
    }

    hideCursor() {
        if (this.cursorVisible) {
            this.cursorVisible = false
            this.cursorElement.classList.add('cursor-hide')
            this.cursorElement.classList.remove('cursor-show')
        }
    }

    showCursor() {
        if (!this.cursorVisible) {
            this.cursorVisible = true
            this.cursorElement.classList.add('cursor-show')
            this.cursorElement.classList.remove('cursor-hide')
        }
    }

    moveCursor(m: HTMLElement) {
        this.cursorElement.style.setProperty('--left', m.offsetLeft.toString())
        this.cursorElement.style.setProperty('--top', m.offsetTop.toString())
        this.cursorElement.style.setProperty('--width', m.offsetWidth.toString())
        this.cursorElement.style.setProperty('--height', m.offsetHeight.toString())
    }
}
customElements.define('ks-fluentmenu', FluentMenu)
