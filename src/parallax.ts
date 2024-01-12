class ParallaxBase extends HTMLElement {
    parallaxChildren: NodeListOf<HTMLElement>

    static observer = new IntersectionObserver(ParallaxBase.observerCallback)

    static observerCallback(entries: IntersectionObserverEntry[]) {
        for (let entry of entries) {
            if (entry.isIntersecting) {
                // update parallax info when we enter view
                // this can be because the DOM loaded or some other element teleported us
                (entry.target as ParallaxBase).updateOffsetFromCenter()
            }
        }
    }

    constructor() {
        super()

        this.parallaxChildren = this.querySelectorAll('[data-parallax]') as NodeListOf<HTMLElement>

        ParallaxBase.observer.observe(this)

        window.addEventListener('scroll', this.updateOffsetFromCenter.bind(this))
    }

    updateOffsetFromCenter() {
        const rect = this.getBoundingClientRect()
        const offsetFromCenter = window.innerHeight / 2 - (rect.top + rect.height / 2)
        this.style.setProperty('--parallax-offset-center', offsetFromCenter.toString())

        for (let child of this.parallaxChildren) {
            const parallaxScale = parseFloat(child.getAttribute('data-parallax') ?? '0')
            child.style.marginTop = (parallaxScale * offsetFromCenter) + 'px'
        }
    }
}

customElements.define('ks-parallaxbase', ParallaxBase)
