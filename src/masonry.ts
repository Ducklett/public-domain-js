export class MasonryElement extends HTMLElement {

    columnElements: HTMLElement[] = []
    masonryChildren: Element[] = []
    currentColumnCount = -1
    container: HTMLElement;
    resizeObserver: ResizeObserver;

    constructor() {
        super();
        const container = this.children[0]

        if (this.children.length != 1) {
            throw new Error('masonry should have a single child element containing the masonry content, actual child count was ' + this.children.length)
        }

        this.container = container as HTMLElement
        this.masonryChildren = [...container.children]

        this.resizeObserver = new ResizeObserver(this.applyLayout.bind(this))
        this.resizeObserver.observe(this.container)

        this.applyLayout()
    }

    applyLayout() {
        const computedStyles = window.getComputedStyle(this.container);

        const columnStyle = computedStyles.gridTemplateColumns
        let colCount = 1
        for (let i = 0; i < columnStyle.length; i++) {
            if (columnStyle[i] == ' ') colCount++
        }

        if (colCount == this.currentColumnCount) {
            return
        }

        if (this.container.offsetHeight == 0 || this.container.offsetWidth == 0) {
            // we are invisible, no reason to do the layout calculation
            return
        }

        // temporarily set the height of the container, otherwise we lose our scroll pos
        this.container.style.minHeight = this.container.offsetHeight + 'px'

        this.container.innerHTML = ''
        while (this.columnElements.length < colCount) {
            const newCol = document.createElement('div')
            newCol.style.display = 'flex'
            newCol.style.gap = computedStyles.gap
            newCol.style.flexDirection = 'column'
            newCol.style.height = 'fit-content'
            this.columnElements.push(newCol)
        }

        for (let col of this.columnElements) {
            col.innerHTML = ''
        }

        for (let i = 0; i < colCount; i++) {
            this.container.appendChild(this.columnElements[i])
        }

        this.currentColumnCount = colCount
        for (let i = 0; i < this.masonryChildren.length; i++) {
            const child = this.masonryChildren[i]
            this.appendChild(child)
        }

        // unset temp height
        this.container.style.minHeight = ''
    }

    appendChild<T extends Node>(node: T): T {
        let colIndex = 0
        let colHeight = this.columnElements[colIndex].offsetHeight
        for (let j = colIndex + 1; j < this.currentColumnCount; j++) {
            const itsHeight = this.columnElements[j].offsetHeight
            if (itsHeight < colHeight) {
                colIndex = j
                colHeight = itsHeight
            }
        }
        this.columnElements[colIndex].appendChild(node)
        return node
    }
}
customElements.define('ks-masonry', MasonryElement)