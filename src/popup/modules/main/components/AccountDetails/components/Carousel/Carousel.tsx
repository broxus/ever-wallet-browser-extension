import { Children, memo, MouseEvent, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { Navigation, Pagination, Virtual } from 'swiper'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import type {
    NavigationOptions,
    PaginationOptions,
    Swiper as SwiperClass,
    SwiperModule,
    VirtualOptions,
} from 'swiper/types'

import { IconButton } from '@app/popup/modules/shared'
import ArrowRightIcon from '@app/popup/assets/icons/arrow-right.svg'
import ArrowLeftIcon from '@app/popup/assets/icons/arrow-left.svg'
import MenuIcon from '@app/popup/assets/icons/menu.svg'

import { AddNewAccountCard } from '../AddNewAccountCard'

import 'swiper/scss'
import 'swiper/scss/virtual'
import 'swiper/scss/pagination'
import 'swiper/scss/navigation'
import './Carousel.scss'

type Props = PropsWithChildren<{
    current: number;
    onChange(index: number): void;
    onAddAccount(): void;
    onChangeAccount(): void;
}>

const TRANSFORM_REGEXP = /translateX\(-?(\d+)px\)/
const BULLET_WIDTH = 16
const MAX_BULLET_COUNT = 10

const modules: SwiperModule[] = [Virtual, Pagination, Navigation]
const virtual: VirtualOptions = {
    enabled: true,
    cache: false,
}
const navigation: NavigationOptions = {
    enabled: true,
    prevEl: '#slider-prev',
    nextEl: '#slider-next',
}
const pagination: PaginationOptions = {
    el: '#slider-pagination',
    type: 'custom',
    renderCustom,
}

export const Carousel = memo((props: Props): JSX.Element => {
    const { current, children, onAddAccount, onChangeAccount, onChange } = props
    const count = Children.toArray(children).length

    const ref = useRef<SwiperRef>(null)

    const handleSlideChange = useCallback(({ activeIndex }: SwiperClass) => onChange(activeIndex), [onChange])
    const handleBulletClick = useCallback((e: MouseEvent) => {
        const element = e.target as HTMLElement

        if (element.dataset.index) {
            const index = parseInt(element.dataset.index, 10)
            ref.current?.swiper.slideTo(index)
        }
    }, [])

    useEffect(() => {
        if (!ref.current) return
        if (current < count && current !== ref.current.swiper.activeIndex) {
            ref.current.swiper.slideTo(current)
        }
    }, [current, count])

    return (
        <div className="carousel">
            <Swiper
                centeredSlides
                ref={ref}
                spaceBetween={16}
                slidesPerView={1}
                longSwipes={false}
                speed={200}
                initialSlide={current}
                modules={modules}
                virtual={virtual}
                pagination={pagination}
                navigation={navigation}
                onSlideChange={handleSlideChange}
            >
                {Children.map(children, (child, index) => (
                    <SwiperSlide virtualIndex={index}>
                        {() => child}
                    </SwiperSlide>
                ))}
                <SwiperSlide key="addSlide" virtualIndex={count}>
                    <AddNewAccountCard onClick={onAddAccount} />
                </SwiperSlide>
            </Swiper>

            <div className="carousel__controls">
                <div className="carousel__controls-pagination">
                    <div className="carousel__controls-pagination-inner">
                        <div id="slider-pagination" className="carousel__bullet-container" onClick={handleBulletClick} />
                    </div>
                </div>

                <div className="carousel__controls-buttons">
                    <IconButton
                        className="carousel__controls-buttons-menu"
                        size="s"
                        design="secondary"
                        icon={<MenuIcon />}
                        onClick={onChangeAccount}
                    />
                    <IconButton
                        id="slider-prev"
                        size="s"
                        design="secondary"
                        icon={<ArrowLeftIcon />}
                    />
                    <IconButton
                        id="slider-next"
                        size="s"
                        design="secondary"
                        icon={<ArrowRightIcon />}
                    />
                </div>
            </div>
        </div>
    )
})

function renderCustom(swiper: SwiperClass, current: number, total: number): string {
    const index = current - 1
    const dynamic = total > MAX_BULLET_COUNT
    const isLast = current === total
    let offset = 0

    if (total !== swiper.pagination.bullets.length) {
        swiper.pagination.bullets = new Array(total)

        for (let i = 0; i < total; i++) {
            const el = document.createElement('div')
            el.classList.add('carousel__bullet')
            el.dataset.index = i.toString()

            swiper.pagination.bullets[i] = el
        }
    }

    for (let i = 0; i < total; i++) {
        const el = swiper.pagination.bullets[i]
        el.classList.remove('_active', '_edge')

        if (i === index) {
            el.classList.add('_active')
        }
    }

    if (dynamic) {
        const container = swiper.pagination.el
        const currentOffset = parseInt(
            container?.style.transform.match(TRANSFORM_REGEXP)?.at(1) ?? '0',
            10,
        )
        let first = currentOffset / BULLET_WIDTH // first visible item index

        if (first + MAX_BULLET_COUNT < index + 2) {
            first = index - MAX_BULLET_COUNT + 2 - (isLast ? 1 : 0)

        }
        if (index <= first) {
            first = Math.max(0, index - 1)
        }

        if (first !== 0) {
            swiper.pagination.bullets.at(first)?.classList.add('_edge')
        }
        if (!isLast && first + MAX_BULLET_COUNT !== total) {
            swiper.pagination.bullets.at(first + MAX_BULLET_COUNT - 1)?.classList.add('_edge')
        }

        offset = first * BULLET_WIDTH * -1
    }

    swiper.pagination.el.style.transform = `translateX(${offset}px)`

    return swiper.pagination.bullets.map((el) => el.outerHTML).join('')
}
