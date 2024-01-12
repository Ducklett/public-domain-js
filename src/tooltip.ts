type TooltipState = {
    tooltipEl: HTMLElement,
    tooltipContentEl: HTMLElement,
    prevAnim?: Animation,
    prevTextAnim?: Animation,
    hideTimeout?: number,
    mouseOverListener: ((this: Window, ev: MouseEvent) => any),
}

let state: TooltipState | undefined = undefined

export function enableTooltips() {

    const tooltipEl = document.createElement('div')
    tooltipEl.classList.add('tooltip', 'tooltip-hidden')

    const tooltipContentEl = document.createElement('span')
    tooltipEl.append(tooltipContentEl)

    document.body.append(tooltipEl)

    state = {
        tooltipEl,
        tooltipContentEl,
        mouseOverListener,
    }

    window.addEventListener('mouseover', state.mouseOverListener)
    window.addEventListener('mouseout', (e: any) => {
        if (e.toElement === null && e.relatedTarget === null) {
            hideTooltip()
        }
    })

    moveTooltipOffscreen()
}

function moveTooltipOffscreen() {
    if (state) {
        state.tooltipEl.style.setProperty('--top', '-9999px')
        state.tooltipEl.style.setProperty('--left', '-9999px')
    }
}

function mouseOverListener(e: MouseEvent) {
    if (!state) return

    const target = e.target as HTMLElement
    const tooltipHolder = target.closest('[data-tooltip]') as HTMLElement
    if (!tooltipHolder) {
        hideTooltip()

        return
    }

    if (state.hideTimeout !== undefined) {
        clearTimeout(state.hideTimeout)
    }

    // don't allow new tooltips to show up if we are using a touchscreen
    if (window.matchMedia("(pointer: coarse)").matches) return

    let dir = tooltipHolder.getAttribute('data-tooltip-dir')
    state.tooltipEl.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right')
    switch (dir) {
        case 'bottom': state.tooltipEl.classList.add('tooltip-bottom'); break;
        case 'left': state.tooltipEl.classList.add('tooltip-left'); break;
        case 'right': state.tooltipEl.classList.add('tooltip-right'); break;
        default: dir = 'top', state.tooltipEl.classList.add('tooltip-top');
    }

    state.tooltipEl.classList.remove('tooltip-hidden')

    const oldTooltipRect = { top: state.tooltipEl.offsetTop, left: state.tooltipEl.offsetLeft, right: state.tooltipEl.offsetLeft + state.tooltipEl.offsetWidth, width: state.tooltipEl.offsetWidth, height: state.tooltipEl.offsetHeight }
    const prevTop = oldTooltipRect.top
    const prevLeft = oldTooltipRect.left
    const prevWidth = oldTooltipRect.width

    state?.prevAnim?.cancel()
    state?.prevTextAnim?.cancel()

    const text = tooltipHolder.getAttribute('data-tooltip')

    state.tooltipContentEl.textContent = text

    const targetRect = { top: tooltipHolder.offsetTop, left: tooltipHolder.offsetLeft, right: tooltipHolder.offsetLeft + tooltipHolder.offsetWidth, width: tooltipHolder.offsetWidth, height: tooltipHolder.offsetHeight }
    const tooltipRect = { top: state.tooltipEl.offsetTop, left: state.tooltipEl.offsetLeft, right: state.tooltipEl.offsetLeft + state.tooltipEl.offsetWidth, width: state.tooltipEl.offsetWidth, height: state.tooltipEl.offsetHeight }

    // TODO: actually determine this based on how much overlap we want and how big the ::before (arrow) element is
    const magicOffset = 6

    const slideTolerance = 2
    let top, left, width, shouldSlide = false
    switch (dir) {
        case 'top':
            top = targetRect.top - tooltipRect.height - magicOffset
            left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
            width = tooltipRect.width
            shouldSlide = Math.abs(top - prevTop) < slideTolerance
            break;
        case 'bottom':
            top = targetRect.top + targetRect.height + magicOffset
            left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
            width = tooltipRect.width
            shouldSlide = Math.abs(top - prevTop) < slideTolerance
            break;
        case 'left':
            top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
            left = targetRect.left - tooltipRect.width - magicOffset
            width = tooltipRect.width
            shouldSlide = Math.abs((left + width) - (prevLeft + prevWidth)) < slideTolerance
            break;
        case 'right':
            top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
            left = targetRect.right + magicOffset
            width = tooltipRect.width
            shouldSlide = Math.abs(left - prevLeft) < slideTolerance
            break;
    }

    // TODO: consider some alternative to concatenating strings
    // TODO: consider reusing the animation definition instead of creating a new one each time

    state.tooltipEl.style.setProperty('--top', top + 'px')
    state.tooltipEl.style.setProperty('--left', left + 'px')

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion && shouldSlide) {
        state.prevAnim = state.tooltipEl.animate([
            { top: prevTop + 'px', left: prevLeft + 'px', width: prevWidth + 'px' },
            { top: top + 'px', left: left + 'px', width: width + 'px' },
        ], {
            easing: 'ease-out',
            duration: 200
        })
    }
}

function hideTooltip() {
    if (!state) return
    if (!state.tooltipEl.classList.contains('tooltip-hidden')) {
        state.tooltipEl.classList.add('tooltip-hidden')

        state.hideTimeout = setTimeout(moveTooltipOffscreen, 1000);
    }
}
